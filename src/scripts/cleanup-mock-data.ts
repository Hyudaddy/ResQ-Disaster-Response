import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupMockData() {
  try {
    console.log('Starting cleanup of mock data...');

    // Delete all incidents
    const { error: incidentsError } = await supabase
      .from('incidents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep system incidents if any

    if (incidentsError) {
      console.error('Error deleting incidents:', incidentsError);
    } else {
      console.log('Successfully deleted all incidents');
    }

    // Delete all profiles except system accounts
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep system profiles if any

    if (profilesError) {
      console.error('Error deleting profiles:', profilesError);
    } else {
      console.log('Successfully deleted all profiles');
    }

    // Delete all auth users except system accounts
    const { error: authError } = await supabase.auth.admin.deleteUser(
      '00000000-0000-0000-0000-000000000000' // Keep system users if any
    );

    if (authError) {
      console.error('Error deleting auth users:', authError);
    } else {
      console.log('Successfully deleted all auth users');
    }

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupMockData(); 