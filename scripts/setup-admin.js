import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAdmin() {
    console.log('Setting up admin user...')

    // First try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'nojs2115@yahoo.com',
        password: 'Password123!',
        options: {
            data: {
                role: 'super_admin'
            }
        }
    })

    if (signUpError) {
        console.error('Sign up error:', signUpError.message)
        
        // If user might already exist, try to sign in
        console.log('\nTrying to sign in instead...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'nojs2115@yahoo.com',
            password: 'Password123!'
        })

        if (signInError) {
            console.error('Sign in error:', signInError.message)
            
            // Try to get error details
            const { error: sessionError } = await supabase.auth.getSession()
            if (sessionError) {
                console.error('Session error:', sessionError.message)
            }
        } else {
            console.log('Successfully signed in!')
            console.log(signInData)
        }
    } else {
        console.log('Successfully signed up!')
        console.log(signUpData)
    }
}

setupAdmin().catch(console.error)
