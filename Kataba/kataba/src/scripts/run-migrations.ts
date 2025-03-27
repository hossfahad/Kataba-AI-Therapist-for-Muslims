import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Running database migrations...');
    
    // Path to migration files
    const migrationsDir = path.join(process.cwd(), 'src', 'lib', 'migrations');
    
    // Read all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run migrations in alphabetical order
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL migration
      await pool.query(sql);
      console.log(`Migration complete: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 