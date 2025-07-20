import { NextRequest, NextResponse } from 'next/server'
import { wechatAuth } from '@/lib/wechat-auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect('/?error=no_code')
  }
  
  try {
    // Get access token using wechat-oauth library
    const tokenResult = await wechatAuth.getAccessToken(code)
    
    // Get user info
    const userInfo = await wechatAuth.getUserInfo(
      tokenResult.data.openid,
      tokenResult.data.access_token
    )

    // Authenticate user with Supabase
    const { user, isNew } = await wechatAuth.authenticateUser(userInfo)

    // Success - redirect to dashboard
    return NextResponse.redirect('/dashboard')
    
  } catch (error) {
    console.error('WeChat OAuth error:', error)
    return NextResponse.redirect('/?error=oauth_failed')
  }
} 