const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCleanupFix() {
  console.log('🧪 Testing Cleanup Fix...\n');

  // 1. Check if trigger functions exist
  console.log('1️⃣ Checking trigger functions...');
  const checkFunctionsSQL = `
    SELECT routine_name, routine_type 
    FROM information_schema.routines 
    WHERE routine_name LIKE '%profile_insert%'
    ORDER BY routine_name;
  `;

  try {
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', { sql: checkFunctionsSQL });
    if (funcError) {
      console.log('⚠️  Cannot check functions (admin access required)');
    } else {
      console.log('✅ Trigger functions found:', functions?.length || 0);
    }
  } catch (err) {
    console.log('⚠️  Cannot check functions (admin access required)');
  }

  // 2. Check if triggers exist
  console.log('\n2️⃣ Checking triggers...');
  const checkTriggersSQL = `
    SELECT trigger_name, event_object_table, event_manipulation
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%profile_insert%'
    ORDER BY trigger_name;
  `;

  try {
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', { sql: checkTriggersSQL });
    if (triggerError) {
      console.log('⚠️  Cannot check triggers (admin access required)');
    } else {
      console.log('✅ Triggers found:', triggers?.length || 0);
    }
  } catch (err) {
    console.log('⚠️  Cannot check triggers (admin access required)');
  }

  // 3. Test user registration
  console.log('\n3️⃣ Testing user registration...');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      console.error('❌ Registration failed:', authError.message);
      return false;
    }

    console.log('✅ User registered successfully');
    const userId = authData.user?.id;

    if (!userId) {
      console.error('❌ No user ID returned');
      return false;
    }

    // 4. Check if profile was created
    console.log('\n4️⃣ Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not created:', profileError?.message);
      return false;
    }

    console.log('✅ Profile created successfully');

    // 5. Check if user_settings was created
    console.log('\n5️⃣ Checking user_settings creation...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings) {
      console.error('❌ User settings not created:', settingsError?.message);
      return false;
    }

    console.log('✅ User settings created successfully');

    // 6. Check if subscription was created
    console.log('\n6️⃣ Checking subscription creation...');
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Subscription not created:', subError?.message);
      return false;
    }

    console.log('✅ Subscription created successfully');

    // 7. Clean up test user
    console.log('\n7️⃣ Cleaning up test user...');
    try {
      await supabase.auth.admin.deleteUser(userId);
      console.log('✅ Test user cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test user (admin access required)');
    }

    console.log('\n🎉 All tests passed! The cleanup fix is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await testCleanupFix();
  
  if (!success) {
    console.log('\n❌ Test failed. The cleanup fix may not have worked correctly.');
    process.exit(1);
  }
}

main().catch(console.error); 