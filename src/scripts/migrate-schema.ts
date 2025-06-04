import { supabase } from '../lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateSchema() {
  try {
    console.log('Starting database migration...\n');

    // Read the schema file
    const schemaPath = join(__dirname, '../lib/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
        throw error;
      }
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSchema(); 