import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuthSetup() {
    console.log('Checking Supabase setup...\n')

    // Check if auth schema exists
    const { data: authSchemaCheck, error: authSchemaError } = await supabase
        .rpc('check_schema_existence', { schema_name: 'auth' })
        .single()

    if (authSchemaError) {
        console.error('Error checking auth schema:', authSchemaError.message)
    } else {
        console.log('Auth schema exists:', authSchemaCheck)
    }

    // Check users table structure
    const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(0)

    if (tableError) {
        console.error('Error checking users table:', tableError.message)
        // Try to get error details
        const { data: errorDetails } = await supabase
            .rpc('get_table_info', { table_name: 'users' })
        console.log('Table info:', errorDetails)
    } else {
        console.log('Users table exists and is accessible')
        console.log('Table structure:', tableInfo)
    }

    // Check if admins table exists and its content
    const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('*')

    if (adminsError) {
        console.error('Error checking admins table:', adminsError.message)
    } else {
        console.log('\nAdmins table data:')
        console.log(admins)
    }

    // Try to check auth.users table (if we have access)
    const { data: authUsers, error: authUsersError } = await supabase
        .rpc('list_auth_users')
        .single()

    if (authUsersError) {
        console.error('Error checking auth.users:', authUsersError.message)
    } else {
        console.log('\nAuth users data:')
        console.log(authUsers)
    }
}

checkAuthSetup().catch(console.error)
