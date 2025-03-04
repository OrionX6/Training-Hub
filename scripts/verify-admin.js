import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key for admin operations

if (!supabaseKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required.')
    console.log('\nPlease add your Supabase service role key to the .env file:')
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    console.log('\nYou can find this in your Supabase dashboard under Project Settings -> API')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAdmin() {
    console.log('Verifying admin user...')

    // Update user metadata to mark email as verified
    const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
        'ea9ae752-4a03-4dcc-8df8-0af21fc52396', // ID from previous script
        { 
            email_confirm: true,
            user_metadata: { 
                email_verified: true,
                role: 'super_admin'
            }
        }
    )

    if (updateError) {
        console.error('Error updating user:', updateError.message)
    } else {
        console.log('Successfully verified admin user:')
        console.log(user)
    }
}

verifyAdmin().catch(console.error)
