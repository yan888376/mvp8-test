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

async function testTriggers() {
  console.log('🧪 Testing Database Triggers...\n')

  try {
    // Test 1: Check if trigger functions exist
    console.log('1️⃣ Checking trigger functions...')
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_trigger_functions')
      .select('*')
    
    if (functionsError) {
      console.log('⚠️  Cannot check trigger functions directly')
      console.log('   Error:', functionsError.message)
    } else {
      console.log(`✅ Found ${functions.length} trigger functions`)
      functions.forEach(func => {
        console.log(`   - ${func.routine_name}`)
      })
    }

    // Test 2: Check if triggers exist on auth.users
    console.log('\n2️⃣ Checking triggers on auth.users...')
    
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_auth_triggers')
      .select('*')
    
    if (triggersError) {
      console.log('⚠️  Cannot check auth triggers directly')
      console.log('   Error:', triggersError.message)
    } else {
      console.log(`✅ Found ${triggers.length} triggers on auth.users`)
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation})`)
      })
    }

    // Test 3: Check RLS status
    console.log('\n3️⃣ Checking RLS status...')
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_rls_status')
      .select('*')
    
    if (rlsError) {
      console.log('⚠️  Cannot check RLS status directly')
      console.log('   Error:', rlsError.message)
    } else {
      console.log('✅ RLS Status:')
      rlsStatus.forEach(table => {
        console.log(`   - ${table.tablename}: ${table.rowsecurity ? 'Enabled' : 'Disabled'}`)
      })
    }

    // Test 4: Check current policies
    console.log('\n4️⃣ Checking current policies...')
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_current_policies')
      .select('*')
    
    if (policiesError) {
      console.log('⚠️  Cannot check policies directly')
      console.log('   Error:', policiesError.message)
    } else {
      console.log(`✅ Found ${policies.length} policies`)
      policies.forEach(policy => {
        console.log(`   - ${policy.tablename}.${policy.policyname} (${policy.cmd})`)
      })
    }

    // Test 5: Try to manually insert a test profile (this will help us see the exact error)
    console.log('\n5️⃣ Testing manual profile insertion...')
    
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          custom_count: 0,
          is_pro: false
        })
        .select()
      
      if (insertError) {
        console.log(`❌ Manual insert failed: ${insertError.message}`)
        console.log(`   Code: ${insertError.code}`)
        console.log(`   Details: ${insertError.details}`)
        console.log(`   Hint: ${insertError.hint}`)
      } else {
        console.log('✅ Manual insert succeeded')
        
        // Clean up the test data
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId)
        console.log('   Test data cleaned up')
      }
    } catch (error) {
      console.log(`❌ Manual insert error: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testTriggers() 