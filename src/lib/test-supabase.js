// src/lib/test-supabase.js
// CommonJS version (works with Node.js)

// Use require() instead of import for Node.js
const { supabase } = require('./supabase.js')

async function testConnection() {
    console.log('🔄 Testing Supabase connection...')

    try {
        // Check if supabase is initialized
        if (!supabase) {
            console.error('❌ Supabase client is not initialized')
            return false
        }

        console.log('✅ Supabase client loaded')

        // Try a simple query
        const { data, error } = await supabase
            .from('movies')
            .select('id')
            .limit(1)

        if (error) {
            console.error('❌ Query failed:', error.message)
            console.log('\n⚠️  Common issues:')
            console.log('1. Check your Supabase URL and key')
            console.log('2. Make sure your table name is "movies"')
            console.log('3. Check if RLS (Row Level Security) is enabled')
            return false
        }

        console.log('✅ Connection successful!')
        console.log('📊 Sample data:', data)
        return true

    } catch (err) {
        console.error('❌ Unexpected error:', err.message)
        return false
    }
}

// Run the test
testConnection().then(success => {
    if (success) {
        console.log('\n🎉 Supabase is working correctly!')
        process.exit(0)
    } else {
        console.log('\n🔧 Please fix the issues above')
        process.exit(1)
    }
})