const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found')
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  })
  
  return env
}

const env = loadEnv()

// Initialize Supabase client
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBasicInserts() {
  console.log('🧪 Testing Basic Database Inserts...\n')

  try {
    // Generate a test UUID
    const testUserId = '550e8400-e29b-41d4-a716-446655440000' // Fixed UUID for testing
    const testEmail = 'test@example.com'

    console.log('1️⃣ Testing profiles table insert...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        full_name: 'Test User',
        avatar_url: '',
        custom_count: 0,
        is_pro: false
      })
      .select()

    if (profileError) {
      console.log(`❌ Profiles insert error: ${profileError.message}`)
    } else {
      console.log(`✅ Profiles insert successful: ${profileData.length} record(s)`)
    }

    console.log('\n2️⃣ Testing user_settings table insert...')
    const { data: settingsData, error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: testUserId,
        theme: 'light',
        language: 'en',
        notifications_enabled: true
      })
      .select()

    if (settingsError) {
      console.log(`❌ Settings insert error: ${settingsError.message}`)
    } else {
      console.log(`✅ Settings insert successful: ${settingsData.length} record(s)`)
    }

    console.log('\n3️⃣ Testing subscriptions table insert...')
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: testUserId,
        plan_type: 'free',
        status: 'active'
      })
      .select()

    if (subError) {
      console.log(`❌ Subscriptions insert error: ${subError.message}`)
    } else {
      console.log(`✅ Subscriptions insert successful: ${subData.length} record(s)`)
    }

    // Clean up test data
    console.log('\n4️⃣ Cleaning up test data...')
    await supabase.from('subscriptions').delete().eq('user_id', testUserId)
    await supabase.from('user_settings').delete().eq('user_id', testUserId)
    await supabase.from('profiles').delete().eq('id', testUserId)
    console.log('✅ Test data cleaned up')

    console.log('\n📊 Summary:')
    console.log(`- Profiles: ${profileError ? '❌' : '✅'}`)
    console.log(`- Settings: ${settingsError ? '❌' : '✅'}`)
    console.log(`- Subscriptions: ${subError ? '❌' : '✅'}`)

  } catch (error) {
    console.error('❌ Error testing basic inserts:', error.message)
  }
}

// Run the test
testBasicInserts() 