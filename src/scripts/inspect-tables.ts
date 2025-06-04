import { supabase } from '../lib/supabase';

async function inspectTables() {
  try {
    console.log('Inspecting Supabase tables...\n');

    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      return;
    }

    console.log('Available tables:');
    for (const table of tables) {
      console.log(`\nInspecting table: ${table.table_name}`);
      
      // Get columns for each table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name);

      if (columnsError) {
        console.error(`Error getting columns for ${table.table_name}:`, columnsError);
        continue;
      }

      console.log('Columns:');
      columns.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

inspectTables(); 