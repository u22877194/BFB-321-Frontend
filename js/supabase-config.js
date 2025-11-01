/**
 * SUPABASE CONFIGURATION
 * Initialize Supabase client
 */

const SUPABASE_URL = 'https://pxfhvplulihsmgtfrqpm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Zmh2cGx1bGloc21ndGZycXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ2OTYsImV4cCI6MjA3NTExMDY5Nn0._5DKvRk03DGrWF8SBrm_vMkqcfelbd-xN1-OBv9Z_XI';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        
        console.log('✅ Supabase connected successfully!');
        return true;
    } catch (err) {
        console.error('❌ Supabase connection failed:', err);
        return false;
    }
}

// Auto-test connection on load
testSupabaseConnection();