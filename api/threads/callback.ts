import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // This is the user.id passed during redirect
  const error = url.searchParams.get('error')

  const baseUrl = `${url.protocol}//${url.host}`
  
  if (error) {
    return Response.redirect(`${baseUrl}/you?error=threads_auth_rejected`)
  }

  if (!code || !state) {
    return Response.redirect(`${baseUrl}/you?error=threads_missing_code`)
  }

  try {
    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_THREADS_APP_ID || '',
        client_secret: process.env.THREADS_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/api/threads/callback`,
        code,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Threads Token Error:', tokenData)
      return Response.redirect(`${baseUrl}/you?error=threads_token_failed_${tokenData?.error_message?.replace(/ /g, '_') || 'unknown'}`)
    }

    const { access_token } = tokenData

    const profileRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const profileData = await profileRes.json()

    if (!profileRes.ok) {
      console.error('Threads Profile Error:', profileData)
      return Response.redirect(`${baseUrl}/you?error=threads_profile_failed_${profileData?.error?.message?.replace(/ /g, '_') || 'unknown'}`)
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      return Response.redirect(`${baseUrl}/you?error=server_configuration_error`)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { error: updateError } = await supabase.auth.admin.updateUserById(state, {
      user_metadata: {
        threads_id: profileData.id,
        threads_username: profileData.username,
        threads_pfp: profileData.threads_profile_picture_url,
        threads_name: profileData.name
      }
    })

    if (updateError) {
      console.error('Supabase Update Error:', updateError)
      return Response.redirect(`${baseUrl}/you?error=threads_link_failed`)
    }

    return Response.redirect(`${baseUrl}/you?confirm_threads=true&threads_username=${profileData.username}`)

  } catch (err) {
    console.error('Unexpected serverless error:', err)
    return Response.redirect(`${baseUrl}/you?error=threads_unexpected_error`)
  }
}
