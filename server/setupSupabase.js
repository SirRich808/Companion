import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config({ path: '.env.local' });

const run = async () => {
  console.log('Running Supabase database setup...');
  const statements = `
    create extension if not exists "pgcrypto";

    create table if not exists projects (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      goal text not null,
      status text not null default 'active',
      initial_context text,
      current_state jsonb,
      previous_state jsonb,
      risk_alerts jsonb,
      share_id text unique,
      is_shared boolean default false,
      created_at timestamptz not null default timezone('utc', now()),
      updated_at timestamptz not null default timezone('utc', now())
    );

    create table if not exists project_updates (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references projects(id) on delete cascade,
      update_text text not null,
      structured_state jsonb,
      tags text[],
      created_at timestamptz not null default timezone('utc', now())
    );

    create table if not exists update_comments (
      id uuid primary key default gen_random_uuid(),
      update_id uuid not null references project_updates(id) on delete cascade,
      author text not null,
      comment_text text not null,
      created_at timestamptz not null default timezone('utc', now())
    );

    create index if not exists idx_project_updates_project_created
      on project_updates(project_id, created_at asc);

    create index if not exists idx_projects_status
      on projects(status);
    
    create index if not exists idx_projects_share_id
      on projects(share_id) where share_id is not null;
    
    create index if not exists idx_project_updates_tags
      on project_updates using gin(tags);
    
    create index if not exists idx_update_comments_update
      on update_comments(update_id, created_at desc);
  `;

  try {
    await pool.query(statements);
    console.log('Supabase database setup completed.');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
