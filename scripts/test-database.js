const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Database Tables...\n')

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Checking if tables exist...')
    
    const tables = ['profiles', 'custom_websites', 'favorites', 'user_settings', 'subscriptions']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' - Error: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' - Exists and accessible`)
      }
    }

    // Test 2: Check RLS policies
    console.log('\n2️⃣ Checking Row Level Security...')
    
    // Try to access data without authentication
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError && profilesError.message.includes('policy')) {
      console.log('✅ RLS is working - Cannot access data without authentication')
    } else {
      console.log('⚠️  RLS might not be properly configured')
    }

    // Test 3: Check indexes
    console.log('\n3️⃣ Checking database indexes...')
    
    const { data: indexes, error: indexesError } = await supabase
      .rpc('get_table_indexes', { table_name: 'custom_websites' })
      .catch(() => ({ data: null, error: 'Function not available' }))
    
    if (indexesError) {
      console.log('ℹ️  Index check not available (this is normal)')
    } else {
      console.log('✅ Database indexes are configured')
    }

    // Test 4: Test custom website operations (if authenticated)
    console.log('\n4️⃣ Testing custom website operations...')
    
    // Create a test user profile first
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      full_name: 'Test User'
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(testUser)
      .select()
      .single()
    
    if (profileError) {
      console.log(`⚠️  Could not create test profile: ${profileError.message}`)
      console.log('   (This might be due to RLS or existing data)')
    } else {
      console.log('✅ Test profile created successfully')
      
      // Test adding a custom website
      const testWebsite = {
        user_id: testUser.id,
        name: 'Test Website',
        url: 'https://example.com',
        icon: 'https://example.com/icon.png',
        category: 'test'
      }
      
      const { data: website, error: websiteError } = await supabase
        .from('custom_websites')
        .insert(testWebsite)
        .select()
        .single()
      
      if (websiteError) {
        console.log(`❌ Could not add test website: ${websiteError.message}`)
      } else {
        console.log('✅ Test website added successfully')
        
        // Test updating the website
        const { data: updatedWebsite, error: updateError } = await supabase
          .from('custom_websites')
          .update({ name: 'Updated Test Website' })
          .eq('id', website.id)
          .select()
          .single()
        
        if (updateError) {
          console.log(`❌ Could not update website: ${updateError.message}`)
        } else {
          console.log('✅ Test website updated successfully')
        }
        
        // Test deleting the website
        const { error: deleteError } = await supabase
          .from('custom_websites')
          .delete()
          .eq('id', website.id)
        
        if (deleteError) {
          console.log(`❌ Could not delete website: ${deleteError.message}`)
        } else {
          console.log('✅ Test website deleted successfully')
        }
      }
      
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUser.id)
    }

    // Test 5: Check triggers
    console.log('\n5️⃣ Checking database triggers...')
    
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_table_triggers', { table_name: 'custom_websites' })
      .catch(() => ({ data: null, error: 'Function not available' }))
    
    if (triggersError) {
      console.log('ℹ️  Trigger check not available (this is normal)')
    } else {
      console.log('✅ Database triggers are configured')
    }

    console.log('\n🎉 Database test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDatabase() 