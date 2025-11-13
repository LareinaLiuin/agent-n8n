// 测试OpenAI API连接
const dotenv = require('dotenv');
const OpenAI = require('openai');

// 加载环境变量
dotenv.config();

console.log('🔍 Testing OpenAI API Configuration...');
console.log('API Key:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'undefined');
console.log('Base URL:', process.env.OPENAI_BASE_URL);

async function testOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    console.log('\n📡 Sending test request to OpenAI API...');
    console.log('Using model: gpt-3.5-turbo');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手。'
        },
        {
          role: 'user',
          content: '请回复"测试成功"，确认API连接正常。'
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    console.log('\n📦 Raw API Response:', JSON.stringify(completion, null, 2));

    if (completion && completion.choices && completion.choices.length > 0) {
      const response = completion.choices[0]?.message?.content;
      console.log('\n✅ AI Response:', response);
      console.log('\n🎉 OpenAI API is working correctly!');
    } else {
      console.log('\n⚠️ Unexpected response format');
    }

  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('Error Message:', error.message);
    console.error('Error Type:', error.constructor.name);

    if (error.response) {
      console.error('\n📄 Error Response Details:');
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.stack) {
      console.error('\n📚 Stack Trace (first 500 chars):', error.stack.substring(0, 500));
    }
  }
}

testOpenAI();