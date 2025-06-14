import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://zovxsfyvhaexrzeuacna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdnhzZnl2aGFleHJ6ZXVhY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjcyOTksImV4cCI6MjA2Mzc0MzI5OX0.qjS8lzLjEQvPd0ED8yWCN6uKZ7A8QTxzHu-fplPrWPA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runMigration() {
  try {
    console.log('Starting database migration...\n')

    // Read the migration file
    const migrationPath = join(__dirname, 'update-schema.sql')
    const migration = readFileSync(migrationPath, 'utf8')

    // Split the migration into individual statements
    const statements = migration
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`)
      
      const { error } = await supabase.from('_exec_sql').select('*').eq('query', statement).single()

      if (error) {
        console.error('Error executing statement:', error)
        console.error('Statement:', statement)
        throw error
      }
    }

    console.log('\nMigration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration() 