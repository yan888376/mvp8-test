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

async function testUserRegistration() {
  console.log('🧪 Testing User Registration...\n')

  const testEmail = 'zyx18870661556@163.com'
const testPassword = '22222222'

  try {
    // Step 1: Check if user already exists
    console.log('1️⃣ Checking if user already exists...')
    const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.log('⚠️  Cannot check existing users (admin access required)')
    } else {
      const userExists = existingUser.users.find(u => u.email === testEmail)
      if (userExists) {
        console.log(`✅ User ${testEmail} already exists`)
        console.log(`   User ID: ${userExists.id}`)
        console.log(`   Created: ${userExists.created_at}`)
      } else {
        console.log(`❌ User ${testEmail} does not exist`)
      }
    }

    // Step 2: Check current database state
    console.log('\n2️⃣ Checking current database state...')
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
    
    if (profilesError) {
      console.log(`❌ Error checking profiles: ${profilesError.message}`)
    } else {
      console.log(`📊 Profiles for ${testEmail}: ${profiles.length} records`)
      if (profiles.length > 0) {
        console.log(`   Profile ID: ${profiles[0].id}`)
        console.log(`   Custom Count: ${profiles[0].custom_count}`)
        console.log(`   Is Pro: ${profiles[0].is_pro}`)
      }
    }

    // Check user_settings table
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', profiles?.[0]?.id || 'not-found')
    
    if (settingsError) {
      console.log(`❌ Error checking user_settings: ${settingsError.message}`)
    } else {
      console.log(`📊 User settings: ${settings.length} records`)
      if (settings.length > 0) {
        console.log(`   Theme: ${settings[0].theme}`)
        console.log(`   Language: ${settings[0].language}`)
      }
    }

    // Check subscriptions table
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profiles?.[0]?.id || 'not-found')
    
    if (subscriptionsError) {
      console.log(`❌ Error checking subscriptions: ${subscriptionsError.message}`)
    } else {
      console.log(`📊 Subscriptions: ${subscriptions.length} records`)
      if (subscriptions.length > 0) {
        console.log(`   Plan: ${subscriptions[0].plan}`)
        console.log(`   Status: ${subscriptions[0].status}`)
      }
    }

    // Step 3: Test user registration
    console.log('\n3️⃣ Testing user registration...')
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
      console.log(`   Email confirmed: ${signUpData.user.email_confirmed_at ? 'Yes' : 'No'}`)
      
      // Step 4: Check if profile was created
      console.log('\n4️⃣ Checking if profile was created...')
      
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

      // Step 5: Check if settings were created
      console.log('\n5️⃣ Checking if settings were created...')
      
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

      // Step 6: Check if subscription was created
      console.log('\n6️⃣ Checking if subscription was created...')
      
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

    } else {
      console.log(`⚠️  Registration completed but no user data returned`)
      console.log(`   This might indicate email confirmation is required`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testUserRegistration() 