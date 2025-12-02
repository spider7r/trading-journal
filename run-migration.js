const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we're not in Next.js context
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: Anon key might not have permission to alter tables. 
// We usually need SERVICE_ROLE_KEY for DDL. 
// Let's check if SERVICE_ROLE_KEY exists in env, otherwise we might be stuck.
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.log('Available keys:', Object.keys(env));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = `
-- Drop the existing table if it exists to ensure clean state
drop table if exists public.ai_reports;

create table public.ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  trade_id uuid references public.trades(id) on delete cascade,
  report_content text not null,
  rating integer,
  type text default 'trade_review',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.ai_reports enable row level security;

create policy "Users can view their own ai reports"
  on public.ai_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ai reports"
  on public.ai_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own ai reports"
  on public.ai_reports for delete
  using (auth.uid() = user_id);
`;

async function runMigration() {
    console.log('Running migration...');
    // Supabase JS client doesn't support raw SQL execution directly on the public interface usually.
    // However, we can try to use the rpc interface if there is a function, OR 
    // we have to rely on the user to run it in the dashboard.
    // WAIT! If we have the Postgres connection string, we can use 'pg' library.
    // But we don't have 'pg' installed probably.

    // Alternative: We can try to use the REST API to create the table? No.

    console.log('Cannot run DDL via supabase-js client directly.');
    console.log('Please run the following SQL in your Supabase Dashboard SQL Editor:');
    console.log(sql);
}

// Actually, let's try to see if we can use the 'pg' library if it happens to be installed?
// Or just notify the user.
runMigration();
