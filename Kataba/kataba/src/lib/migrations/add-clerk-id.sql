-- Check if the users table exists first
DO $$
BEGIN
    -- Check if the users table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        -- Add clerk_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'clerk_id'
        ) THEN
            ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;
        END IF;
    END IF;
END $$; 