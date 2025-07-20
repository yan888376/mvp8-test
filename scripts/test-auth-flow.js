require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthFlow() {
  console.log('🧪 测试认证流程和数据库功能...\n')

  try {
    // 1. 测试匿名访问
    console.log('1️⃣ 测试匿名访问...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('ℹ️  当前无用户登录 (正常)')
    } else {
      console.log('✅ 当前用户:', user.email)
    }

    // 2. 测试表访问权限
    console.log('\n2️⃣ 测试表访问权限...')
    
    // 测试profiles表
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ profiles表访问失败:', profilesError.message)
    } else {
      console.log('✅ profiles表可访问')
    }

    // 测试custom_websites表
    const { data: websites, error: websitesError } = await supabase
      .from('custom_websites')
      .select('count')
      .limit(1)
    
    if (websitesError) {
      console.log('❌ custom_websites表访问失败:', websitesError.message)
    } else {
      console.log('✅ custom_websites表可访问')
    }

    // 测试favorites表
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('count')
      .limit(1)
    
    if (favoritesError) {
      console.log('❌ favorites表访问失败:', favoritesError.message)
    } else {
      console.log('✅ favorites表可访问')
    }

    // 3. 测试用户注册（使用真实邮箱）
    console.log('\n3️⃣ 测试用户注册...')
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (signUpError) {
      console.log('❌ 用户注册失败:', signUpError.message)
      
      // 如果是邮箱确认问题，尝试登录
      if (signUpError.message.includes('confirm')) {
        console.log('ℹ️  尝试登录已存在的用户...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'testpassword123'
        })
        
        if (signInError) {
          console.log('❌ 登录失败:', signInError.message)
        } else {
          console.log('✅ 登录成功:', signInData.user.email)
          await testUserOperations(signInData.user.id)
        }
      }
    } else {
      console.log('✅ 用户注册成功:', signUpData.user.email)
      await testUserOperations(signUpData.user.id)
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

async function testUserOperations(userId) {
  console.log('\n4️⃣ 测试用户操作...')
  
  try {
    // 等待一下让触发器执行
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 检查用户配置文件
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log('❌ 获取用户配置文件失败:', profileError.message)
    } else {
      console.log('✅ 用户配置文件:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        custom_count: profile.custom_count
      })
    }

    // 测试创建自定义网址
    const { data: website, error: websiteError } = await supabase
      .from('custom_websites')
      .insert({
        user_id: userId,
        name: 'Test Website',
        url: 'https://example.com',
        icon: 'https://example.com/favicon.ico',
        category: 'test'
      })
      .select()
      .single()

    if (websiteError) {
      console.log('❌ 创建自定义网址失败:', websiteError.message)
    } else {
      console.log('✅ 自定义网址创建成功:', website.name)
      
      // 删除测试网址
      await supabase
        .from('custom_websites')
        .delete()
        .eq('id', website.id)
      console.log('✅ 测试网址已删除')
    }

    // 测试添加收藏
    const { data: favorite, error: favoriteError } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        site_id: 'test-site-1',
        site_name: 'Test Site',
        site_url: 'https://testsite.com',
        site_icon: 'https://testsite.com/favicon.ico',
        site_category: 'test'
      })
      .select()
      .single()

    if (favoriteError) {
      console.log('❌ 添加收藏失败:', favoriteError.message)
    } else {
      console.log('✅ 收藏添加成功:', favorite.site_name)
      
      // 删除测试收藏
      await supabase
        .from('favorites')
        .delete()
        .eq('id', favorite.id)
      console.log('✅ 测试收藏已删除')
    }

  } catch (error) {
    console.error('❌ 用户操作测试失败:', error.message)
  }
}

// 运行测试
testAuthFlow() 