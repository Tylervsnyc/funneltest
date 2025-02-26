-- Create the quiz_results table
create table quiz_results (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  initials text not null,
  email text not null,
  score integer not null,
  age_group text not null,
  constraint valid_initials check (length(initials) = 3),
  constraint valid_score check (score >= 0),
  constraint valid_age_group check (age_group in ('4-5', '6-7', '8-9', 'adult'))
);

-- Enable Row Level Security
alter table quiz_results enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable insert access for all users" on quiz_results;
drop policy if exists "Enable read access for all users" on quiz_results;

-- Create new policies with explicit permissions
create policy "Enable insert access for all users"
  on quiz_results for insert
  to authenticated, anon
  with check (true);

create policy "Enable read access for all users"
  on quiz_results for select
  to authenticated, anon
  using (true);

-- Create index for email lookups
create index quiz_results_email_idx on quiz_results(email);

-- Create index for age group and score for leaderboard queries
create index quiz_results_age_score_idx on quiz_results(age_group, score desc);

-- Add comment to table
comment on table quiz_results is 'Stores quiz results and user information for the math quiz'; 