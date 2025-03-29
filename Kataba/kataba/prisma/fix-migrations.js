// Script to check and fix Prisma migration issues
// Run with: node prisma/fix-migrations.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Prisma migration status...');

// 1. First, check if there are pending migrations
exec('npx prisma migrate status', (err, stdout, stderr) => {
  console.log(stdout);
  
  if (stdout.includes('Database schema is up to date!')) {
    console.log('✅ Your database schema is up to date. No fixes needed.');
    return;
  }
  
  // 2. Check for migration directories
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
    console.log('⚠️ No migrations found. Creating initial migration...');
    
    // 3. Create initial migration if none exists
    exec('npx prisma migrate dev --name init --create-only', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Error creating migration:', stderr);
        return;
      }
      
      console.log(stdout);
      console.log('✅ Initial migration created. Now apply it...');
      
      // 4. Apply the migration
      exec('npx prisma migrate deploy', (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Error deploying migration:', stderr);
          return;
        }
        
        console.log(stdout);
        console.log('✅ Migrations applied successfully.');
      });
    });
  } else {
    console.log('⚠️ Found existing migrations. Trying to fix...');
    
    // 5. Reset database (WARNING: This will delete all data!)
    console.log('⚠️ WARNING: The following command will RESET your database and ERASE ALL DATA.');
    console.log('⚠️ Only proceed if this is acceptable or if you have a backup.');
    console.log('📝 To proceed, manually run: npx prisma migrate reset --force');
    console.log('📝 Otherwise, you may need to manually fix migration issues:');
    console.log('   1. Add a different database for shadowDatabaseUrl in schema.prisma');
    console.log('   2. Or try: npx prisma db push --accept-data-loss');
  }
}); 