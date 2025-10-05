-- Add user_id column to projects table
alter table projects add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Create index for user queries
create index if not exists idx_projects_user_id on projects(user_id);

-- Enable Row Level Security
alter table projects enable row level security;
alter table project_updates enable row level security;
alter table update_comments enable row level security;

-- Projects policies: Users can only see/modify their own projects
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Project updates policies: Users can only see/modify updates for their projects
create policy "Users can view updates for their projects"
  on project_updates for select
  using (exists (
    select 1 from projects
    where projects.id = project_updates.project_id
    and projects.user_id = auth.uid()
  ));

create policy "Users can create updates for their projects"
  on project_updates for insert
  with check (exists (
    select 1 from projects
    where projects.id = project_updates.project_id
    and projects.user_id = auth.uid()
  ));

create policy "Users can update their project updates"
  on project_updates for update
  using (exists (
    select 1 from projects
    where projects.id = project_updates.project_id
    and projects.user_id = auth.uid()
  ));

create policy "Users can delete their project updates"
  on project_updates for delete
  using (exists (
    select 1 from projects
    where projects.id = project_updates.project_id
    and projects.user_id = auth.uid()
  ));

-- Update comments policies
create policy "Users can view comments on their project updates"
  on update_comments for select
  using (exists (
    select 1 from project_updates
    join projects on projects.id = project_updates.project_id
    where project_updates.id = update_comments.update_id
    and projects.user_id = auth.uid()
  ));

create policy "Users can create comments on their project updates"
  on update_comments for insert
  with check (exists (
    select 1 from project_updates
    join projects on projects.id = project_updates.project_id
    where project_updates.id = update_comments.update_id
    and projects.user_id = auth.uid()
  ));
