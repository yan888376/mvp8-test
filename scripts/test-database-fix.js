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

async function testDatabaseFix() {
  console.log('🧪 Testing Database Fix...\n')

  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'

  try {
    // Step 1: Test table access
    console.log('1️⃣ Testing table access...')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    
    if (profilesError) {
      console.log(`❌ Profiles table error: ${profilesError.message}`)
    } else {
      console.log('✅ Profiles table accessible')
    }

    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('count(*)')
      .limit(1)
    
    if (settingsError) {
      console.log(`❌ User settings table error: ${settingsError.message}`)
    } else {
      console.log('✅ User settings table accessible')
    }

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('count(*)')
      .limit(1)
    
    if (subscriptionsError) {
      console.log(`❌ Subscriptions table error: ${subscriptionsError.message}`)
    } else {
      console.log('✅ Subscriptions table accessible')
    }

    // Step 2: Test user registration
    console.log('\n2️⃣ Testing user registration...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      console.log(`❌ Registration failed: ${signUpError.message}`)
      return
    }

    if (signUpData.user) {
      console.log(`✅ User registered successfully!`)
      console.log(`   User ID: ${signUpData.user.id}`)
      
      // Step 3: Check if profile was created
      console.log('\n3️⃣ Checking if profile was created...')
      
      // Wait a moment for triggers to execute
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { data: newProfiles, error: newProfilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
      
      if (newProfilesError) {
        console.log(`❌ Error checking new profile: ${newProfilesError.message}`)
      } else if (newProfiles.length > 0) {
        console.log(`✅ Profile created successfully!`)
        console.log(`   Profile ID: ${newProfiles[0].id}`)
        console.log(`   Email: ${newProfiles[0].email}`)
        console.log(`   Custom Count: ${newProfiles[0].custom_count}`)
        console.log(`   Is Pro: ${newProfiles[0].is_pro}`)
      } else {
        console.log(`❌ Profile was NOT created automatically`)
        console.log(`   This indicates a trigger issue`)
      }

      // Step 4: Check if settings were created
      console.log('\n4️⃣ Checking if settings were created...')
      
      const { data: newSettings, error: newSettingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', signUpData.user.id)
      
      if (newSettingsError) {
        console.log(`❌ Error checking new settings: ${newSettingsError.message}`)
      } else if (newSettings.length > 0) {
        console.log(`✅ User settings created successfully!`)
        console.log(`   Theme: ${newSettings[0].theme}`)
        console.log(`   Language: ${newSettings[0].language}`)
      } else {
        console.log(`❌ User settings were NOT created automatically`)
        console.log(`   This indicates a trigger issue`)
      }

      // Step 5: Check if subscription was created
      console.log('\n5️⃣ Checking if subscription was created...')
      
      const { data: newSubscriptions, error: newSubscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', signUpData.user.id)
      
      if (newSubscriptionsError) {
        console.log(`❌ Error checking new subscription: ${newSubscriptionsError.message}`)
      } else if (newSubscriptions.length > 0) {
        console.log(`✅ Subscription created successfully!`)
        console.log(`   Plan: ${newSubscriptions[0].plan}`)
        console.log(`   Status: ${newSubscriptions[0].status}`)
      } else {
        console.log(`❌ Subscription was NOT created automatically`)
        console.log(`   This indicates a trigger issue`)
      }

      // Step 6: Clean up test user
      console.log('\n6️⃣ Cleaning up test user...')
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user.id)
      if (deleteError) {
        console.log(`⚠️  Could not delete test user: ${deleteError.message}`)
      } else {
        console.log('✅ Test user deleted successfully')
      }

    } else {
      console.log(`⚠️  Registration completed but no user data returned`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDatabaseFix() 