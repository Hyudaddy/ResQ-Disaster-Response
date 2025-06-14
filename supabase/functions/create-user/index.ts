import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Log all request headers
    const headers = Object.fromEntries(req.headers.entries())
    console.log('All request headers:', headers)

    // Check for authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Raw auth header:', authHeader)

    if (!authHeader) {
      console.error('No authorization header found')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract the token from the Bearer header
    const token = authHeader.replace('Bearer ', '')
    console.log('Extracted token:', token.substring(0, 20) + '...')

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Log environment variables (without sensitive values)
    console.log('Environment check:', {
      hasProjectUrl: !!Deno.env.get('PROJECT_URL'),
      hasAnonKey: !!Deno.env.get('ANON_KEY'),
      hasServiceRoleKey: !!Deno.env.get('SERVICE_ROLE_KEY'),
    })

    // Create an admin client for user management
    const adminClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // Get the session of the logged in user
    const {
      data: { session },
      error: sessionError
    } = await supabaseClient.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return new Response(
        JSON.stringify({ error: `Session error: ${sessionError.message}` }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!session) {
      console.error('No session found')
      return new Response(
        JSON.stringify({ error: 'No active session' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User session found:', {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.user_metadata?.role,
      expiresAt: session.expires_at
    })

    // Verify that the user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: `Profile error: ${profileError.message}` }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User profile:', profile)

    if (profile?.role !== 'admin') {
      console.error('User is not an admin:', profile?.role)
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the request body
    const body = await req.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })

    const { email, password, full_name, role, department, jurisdiction } = body

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate role-specific requirements
    if ((role === 'responder' || role === 'admin') && (!department || !jurisdiction)) {
      return new Response(
        JSON.stringify({ error: 'Department and jurisdiction are required for responder and admin roles' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create the user using the admin client
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        department: role === 'responder' || role === 'admin' ? department : null,
        jurisdiction: role === 'responder' || role === 'admin' ? jurisdiction : null,
      },
    })

    if (userError) {
      console.error('User creation error:', userError)
      return new Response(
        JSON.stringify({ error: userError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User created successfully:', userData.user.id)

    // Create the profile using the admin client
    const { error: profileCreateError } = await adminClient
      .from('profiles')
      .insert([
        {
          id: userData.user.id,
          email,
          full_name,
          role,
          department: role === 'responder' || role === 'admin' ? department : null,
          jurisdiction: role === 'responder' || role === 'admin' ? jurisdiction : null,
        },
      ])

    if (profileCreateError) {
      console.error('Profile creation error:', profileCreateError)
      // If profile creation fails, delete the auth user
      await adminClient.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Profile created successfully')

    return new Response(
      JSON.stringify({ data: userData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})