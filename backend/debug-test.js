// 调试脚本 - 测试环境变量加载
require('dotenv').config();

console.log('=== 环境变量测试 ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'undefined');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL);

// 测试服务管理器
async function testManager() {
  const { OpenAIServiceManager } = await import('./dist/services/openai.service.manager.js');

  console.log('\n=== 测试服务管理器 ===');
  const manager = OpenAIServiceManager.getInstance();
  console.log('isConfigured():', manager.isConfigured());
  console.log('getConfig():', manager.getConfig());

  if (manager.isConfigured()) {
    manager.initialize();
    const openai = manager.getOpenAI();
    console.log('OpenAI client created:', !!openai);

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: '测试' }],
          max_tokens: 10,
        });
        console.log('✅ API调用成功:', completion.choices[0]?.message?.content);
      } catch (error) {
        console.error('❌ API调用失败:', error.message);
      }
    }
  }
}

testManager();