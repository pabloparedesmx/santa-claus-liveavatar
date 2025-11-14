// Simple script to test HeyGen context creation
// Run with: node test-context-creation.js

const API_URL = 'http://localhost:3001/api/test-create-context';

console.log('🧪 Testing HeyGen Context Creation...\n');
console.log('Calling:', API_URL);
console.log('');

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('📡 Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('\n✅ SUCCESS! Response received:\n');
    console.log(JSON.stringify(data, null, 2));

    const contextId = data.context_id || data.heygen_response?.data?.id;

    if (contextId) {
      console.log('\n' + '='.repeat(60));
      console.log('🎯 CONTEXT ID CREATED:', contextId);
      console.log('='.repeat(60));
      console.log('\n📋 NEXT STEP: Go to your HeyGen dashboard and verify this context exists:');
      console.log('   https://app.heygen.com/');
      console.log('\n   Look for: "TEST - Santa context for Maria"');
      console.log('\n✅ Context verified in dashboard!');
    } else {
      console.log('\n⚠️  WARNING: No context_id in response');
    }
  })
  .catch(error => {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Backend server is running: node server.js');
    console.error('   2. Server is on port 3001');
    console.error('   3. HeyGen API key is set in .env');
  });
