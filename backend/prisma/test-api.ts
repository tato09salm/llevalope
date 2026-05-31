import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function main() {
  console.log('🔍 Testing API:', API_URL);

  try {
    const response = await axios.get(`${API_URL}/productos`, {
      params: {
        todos: true,
        limite: 50,
      },
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

main();
