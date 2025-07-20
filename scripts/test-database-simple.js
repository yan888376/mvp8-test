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
  console.log('Please check your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('\n🧪 Testing Database Tables...\n')

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Checking if tables exist...')
    
    const tables = ['profiles', 'custom_websites', 'favorites', 'user_settings', 'subscriptions']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}' - Error: ${error.message}`)
        } else {
          console.log(`✅ Table '${table}' - Exists and accessible`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - Error: ${err.message}`)
      }
    }

    // Test 2: Check RLS policies
    console.log('\n2️⃣ Checking Row Level Security...')
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)
      
      if (profilesError && profilesError.message.includes('policy')) {
        console.log('✅ RLS is working - Cannot access data without authentication')
      } else if (profilesError) {
        console.log(`⚠️  RLS check: ${profilesError.message}`)
      } else {
        console.log('⚠️  RLS might not be properly configured')
      }
    } catch (err) {
      console.log(`⚠️  RLS check error: ${err.message}`)
    }

    // Test 3: Check table structure
    console.log('\n3️⃣ Checking table structure...')
    
    try {
      const { data: structure, error: structureError } = await supabase
        .from('custom_websites')
        .select('*')
        .limit(0)
      
      if (structureError) {
        console.log(`❌ Structure check failed: ${structureError.message}`)
      } else {
        console.log('✅ Table structure is accessible')
      }
    } catch (err) {
      console.log(`❌ Structure check error: ${err.message}`)
    }

    // Test 4: Test basic operations (will fail due to RLS, but that's expected)
    console.log('\n4️⃣ Testing basic operations...')
    
    try {
      // This should fail due to RLS, which is expected
      const { data, error } = await supabase
        .from('custom_websites')
        .insert({
          user_id: 'test-user',
          name: 'Test Website',
          url: 'https://example.com'
        })
      
      if (error && error.message.includes('policy')) {
        console.log('✅ RLS is working correctly - Cannot insert without authentication')
      } else if (error) {
        console.log(`⚠️  Insert test: ${error.message}`)
      } else {
        console.log('⚠️  Insert succeeded (RLS might not be configured)')
      }
    } catch (err) {
      console.log(`❌ Insert test error: ${err.message}`)
    }

    console.log('\n🎉 Database test completed!')
    console.log('\n📋 Summary:')
    console.log('- If you see ✅ for tables, they exist and are accessible')
    console.log('- If you see ✅ for RLS, security is properly configured')
    console.log('- If you see ❌, there might be configuration issues')
    console.log('\n💡 Next steps:')
    console.log('1. Check your Supabase dashboard to verify tables exist')
    console.log('2. Verify RLS policies are enabled')
    console.log('3. Test with authenticated user in your app')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDatabase() 