# Supabase RLS Fix Instructions

## Issue
The application is encountering a 406 Not Acceptable error when querying the profiles table. This is because Row Level Security (RLS) is enabled but the necessary policies are missing.

## Solution
Run the SQL commands in `fix_profiles_rls.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix_profiles_rls.sql`
4. Execute the query

## What this fixes:
- Allows authenticated users to view their own profile
- Allows authenticated users to update their own profile
- Allows authenticated users to create their initial profile
- Fixes the 406 error that causes the chat API to fail

## Additional Steps:
After applying the RLS policies, you may need to:
1. Clear your browser cache
2. Log out and log back in
3. The application should now work correctly