import { withClient, pool } from './db.js';

const projectColumns = `
  id,
  name,
  goal,
  status,
  initial_context as "initialContext",
  current_state as "currentState",
  previous_state as "previousState",
  risk_alerts as "riskAlerts",
  share_id as "shareId",
  is_shared as "isShared",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

const updateColumns = `
  id,
  project_id as "projectId",
  update_text as "text",
  structured_state as "structuredState",
  tags,
  created_at as "createdAt"
`;

const toMillis = (value) => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? undefined : time;
};

const parseJsonField = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON field from database', error);
    return null;
  }
};

const mapUpdateRow = (row) => ({
  id: row.id,
  projectId: row.projectId,
  text: row.text,
  structuredState: parseJsonField(row.structuredState),
  tags: row.tags || [],
  timestamp: toMillis(row.createdAt) ?? Date.now(),
  comments: [],
});

const mapProjectRow = (row) => ({
  id: row.id,
  name: row.name,
  goal: row.goal,
  status: row.status,
  initialContext: row.initialContext ?? null,
  currentState: parseJsonField(row.currentState),
  previousState: parseJsonField(row.previousState),
  riskAlerts: parseJsonField(row.riskAlerts) || [],
  shareId: row.shareId,
  isShared: row.isShared || false,
  createdAt: toMillis(row.createdAt),
  updatedAt: toMillis(row.updatedAt),
  updates: row.updates ? row.updates.map(mapUpdateRow) : [],
});

const toJson = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  return JSON.stringify(value);
};

export const createProject = async ({ name, goal, status = 'active', initialContext = null, currentState = null, userId = null }) => {
  const { rows } = await pool.query(
    `insert into projects (name, goal, status, initial_context, current_state, user_id)
     values ($1, $2, $3, $4, $5, $6)
     returning ${projectColumns}`,
    [name, goal, status, initialContext, toJson(currentState), userId]
  );

  const createdRow = mapProjectRow(rows[0]);
  const project = await getProjectById(createdRow.id, userId);
  return project ?? { ...createdRow, updates: [] };
};

export const listProjects = async (userId = null) => {
  const query = userId
    ? `select ${projectColumns} from projects where user_id = $1 order by updated_at desc`
    : `select ${projectColumns} from projects order by updated_at desc`;
  
  const params = userId ? [userId] : [];
  const { rows } = await pool.query(query, params);
  return rows.map(mapProjectRow);
};

export const getProjectById = async (projectId, userId = null) => {
  return withClient(async (client) => {
    const whereClause = userId
      ? `where id = $1 and user_id = $2`
      : `where id = $1`;
    const params = userId ? [projectId, userId] : [projectId];
    
    const projectResult = await client.query(
      `select ${projectColumns}
       from projects
       ${whereClause}`,
      params
    );

    if (projectResult.rowCount === 0) {
      return null;
    }

    const updatesResult = await client.query(
      `select ${updateColumns}
       from project_updates
       where project_id = $1
       order by created_at asc`,
      [projectId]
    );

    const project = mapProjectRow(projectResult.rows[0]);
    return {
      ...project,
      updates: updatesResult.rows.map(mapUpdateRow),
    };
  });
};

export const addProjectUpdate = async (projectId, { text, structuredState = null, tags = [] }) => {
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const insertResult = await client.query(
        `insert into project_updates (project_id, update_text, structured_state, tags)
         values ($1, $2, $3, $4)
         returning ${updateColumns}`,
        [projectId, text, toJson(structuredState), tags]
      );

      await client.query(
        `update projects
         set updated_at = timezone('utc', now()),
             current_state = coalesce($2, current_state)
         where id = $1`,
        [projectId, toJson(structuredState)]
      );

      await client.query('COMMIT');
      return mapUpdateRow(insertResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
};

export const updateProjectMeta = async (projectId, { name, goal, status, currentState, previousState, riskAlerts, shareId, isShared, initialContext }) => {
  const fields = [];
  const values = [];

  const pushField = (sql, value) => {
    values.push(value);
    fields.push(`${sql} = $${values.length}`);
  };

  if (name !== undefined) pushField('name', name);
  if (goal !== undefined) pushField('goal', goal);
  if (status !== undefined) pushField('status', status);
  if (currentState !== undefined) pushField('current_state', toJson(currentState));
  if (previousState !== undefined) pushField('previous_state', toJson(previousState));
  if (riskAlerts !== undefined) pushField('risk_alerts', toJson(riskAlerts));
  if (shareId !== undefined) pushField('share_id', shareId);
  if (isShared !== undefined) pushField('is_shared', isShared);
  if (initialContext !== undefined) pushField('initial_context', initialContext);

  if (fields.length === 0) {
    const project = await getProjectById(projectId);
    return project;
  }

  values.push(projectId);

  const { rows } = await pool.query(
    `update projects
     set ${fields.join(', ')},
         updated_at = timezone('utc', now())
     where id = $${values.length}
     returning ${projectColumns}`,
    values
  );

  const project = await getProjectById(projectId);
  return project ?? mapProjectRow(rows[0]);
};

export const deleteProject = async (projectId) => {
  await pool.query('delete from projects where id = $1', [projectId]);
};
