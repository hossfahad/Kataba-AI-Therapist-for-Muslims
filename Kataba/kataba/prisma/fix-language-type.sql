-- Fix for language column in the Conversation table
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Conversation'
        AND column_name = 'language'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE "Conversation" ADD COLUMN "language" TEXT DEFAULT 'en';
    ELSE
        -- Update the column type if it exists
        ALTER TABLE "Conversation" 
        ALTER COLUMN "language" TYPE TEXT,
        ALTER COLUMN "language" SET DEFAULT 'en';
    END IF;
END $$; 