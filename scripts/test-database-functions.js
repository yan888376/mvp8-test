require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 配置Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置，请检查.env.local文件')
  console.log('需要的环境变量:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔧 Supabase配置:')
console.log('- URL:', supabaseUrl)
console.log('- Key:', supabaseKey.substring(0, 20) + '...')
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseFunctions() {
  console.log('🧪 开始测试数据库功能...\n')

  try {
    // 1. 测试用户注册
    console.log('1️⃣ 测试用户注册...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (authError) {
      console.log('❌ 用户注册失败:', authError.message)
      return
    }

    console.log('✅ 用户注册成功:', authData.user?.id)
    const userId = authData.user?.id

    // 等待一下让触发器执行
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. 检查用户配置文件是否创建
    console.log('\n2️⃣ 检查用户配置文件...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log('❌ 获取用户配置文件失败:', profileError.message)
    } else {
      console.log('✅ 用户配置文件创建成功:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        custom_count: profile.custom_count
      })
    }

    // 3. 测试创建自定义网址
    console.log('\n3️⃣ 测试创建自定义网址...')
    const customWebsite = {
      name: 'Test Website',
      url: 'https://example.com',
      icon: 'https://example.com/favicon.ico',
      category: 'test'
    }

    const { data: websiteData, error: websiteError } = await supabase
      .from('custom_websites')
      .insert({
        user_id: userId,
        ...customWebsite
      })
      .select()
      .single()

    if (websiteError) {
      console.log('❌ 创建自定义网址失败:', websiteError.message)
    } else {
      console.log('✅ 自定义网址创建成功:', {
        id: websiteData.id,
        name: websiteData.name,
        url: websiteData.url
      })
    }

    // 4. 测试收藏内置网址
    console.log('\n4️⃣ 测试收藏内置网址...')
    const favoriteSite = {
      site_id: 'test-site-1',
      site_name: 'Test Site',
      site_url: 'https://testsite.com',
      site_icon: 'https://testsite.com/favicon.ico',
      site_category: 'test'
    }

    const { data: favoriteData, error: favoriteError } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        ...favoriteSite
      })
      .select()
      .single()

    if (favoriteError) {
      console.log('❌ 添加收藏失败:', favoriteError.message)
    } else {
      console.log('✅ 收藏添加成功:', {
        id: favoriteData.id,
        site_name: favoriteData.site_name
      })
    }

    // 5. 测试获取用户数据
    console.log('\n5️⃣ 测试获取用户数据...')
    
    // 获取自定义网址
    const { data: websites, error: websitesError } = await supabase
      .from('custom_websites')
      .select('*')
      .eq('user_id', userId)

    if (websitesError) {
      console.log('❌ 获取自定义网址失败:', websitesError.message)
    } else {
      console.log('✅ 获取自定义网址成功:', websites.length, '个网址')
    }

    // 获取收藏
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)

    if (favoritesError) {
      console.log('❌ 获取收藏失败:', favoritesError.message)
    } else {
      console.log('✅ 获取收藏成功:', favorites.length, '个收藏')
    }

    // 6. 测试更新用户配置文件
    console.log('\n6️⃣ 测试更新用户配置文件...')
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        full_name: 'Updated Test User',
        custom_count: 1
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.log('❌ 更新用户配置文件失败:', updateError.message)
    } else {
      console.log('✅ 用户配置文件更新成功:', {
        full_name: updatedProfile.full_name,
        custom_count: updatedProfile.custom_count
      })
    }

    // 7. 测试删除功能
    console.log('\n7️⃣ 测试删除功能...')
    
    // 删除自定义网址
    if (websiteData) {
      const { error: deleteWebsiteError } = await supabase
        .from('custom_websites')
        .delete()
        .eq('id', websiteData.id)

      if (deleteWebsiteError) {
        console.log('❌ 删除自定义网址失败:', deleteWebsiteError.message)
      } else {
        console.log('✅ 自定义网址删除成功')
      }
    }

    // 删除收藏
    if (favoriteData) {
      const { error: deleteFavoriteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteData.id)

      if (deleteFavoriteError) {
        console.log('❌ 删除收藏失败:', deleteFavoriteError.message)
      } else {
        console.log('✅ 收藏删除成功')
      }
    }

    console.log('\n🎉 所有测试完成！')

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testDatabaseFunctions() 