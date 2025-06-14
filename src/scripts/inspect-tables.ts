import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zovxsfyvhaexrzeuacna.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdnhzZnl2aGFleHJ6ZXVhY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjcyOTksImV4cCI6MjA2Mzc0MzI5OX0.qjS8lzLjEQvPd0ED8yWCN6uKZ7A8QTxzHu-fplPrWPA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectTables() {
  try {
    console.log('Inspecting Supabase tables...\n');

    // List of tables to check
    const tables = [
      'profiles',
      'incident_types',
      'locations',
      'incidents',
      'incident_images',
      'incident_responders',
      'resources',
      'incident_resources'
    ];

    for (const tableName of tables) {
      console.log(`\nInspecting table: ${tableName}`);
      
      // Try to get a single row to check if table exists and get its structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`Table ${tableName} does not exist or is not accessible`);
        continue;
      }

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('Columns:');
        columns.forEach(column => {
          console.log(`- ${column}`);
        });
      } else {
        console.log('Table exists but is empty');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

inspectTables(); 