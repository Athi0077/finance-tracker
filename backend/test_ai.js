require('dotenv').config();
const axios = require('axios');

async function testOpenRouter() {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o',
      messages: [{ role: 'user', content: 'Say hello' }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    console.log('SUCCESS:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('ERROR STATUS:', error.response?.status);
    console.error('ERROR DATA:', JSON.stringify(error.response?.data, null, 2));
    console.error('ERROR MESSAGE:', error.message);
  }
}

testOpenRouter();
