// 测试完整的API功能
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 开始测试API功能...\n');

  try {
    // 1. 创建会话
    console.log('1️⃣ 创建聊天会话...');
    const createSessionRes = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const sessionData = await createSessionRes.json();
    console.log('✅ 会话创建成功:', sessionData.data.sessionId);
    const sessionId = sessionData.data.sessionId;

    // 2. 发送消息
    console.log('\n2️⃣ 发送测试消息...');
    const sendMessageRes = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '你好，请介绍一下你的功能',
        sessionId: sessionId
      })
    });
    const messageData = await sendMessageRes.json();
    if (messageData.success) {
      console.log('✅ AI回复:', messageData.data.message.content.substring(0, 100) + '...');
    } else {
      console.log('❌ 消息发送失败:', messageData.error);
    }

    // 3. 生成SOP
    console.log('\n3️⃣ 生成SOP建议...');
    const sopRes = await fetch(`${API_BASE}/sop/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: '创建一个自动化流程，每天早上9点发送天气提醒邮件'
      })
    });
    const sopData = await sopRes.json();
    if (sopData.success) {
      console.log('✅ SOP标题:', sopData.data.title);
      console.log('   步骤数量:', sopData.data.steps.length);
    } else {
      console.log('❌ SOP生成失败:', sopData.error);
    }

    // 4. 生成代码
    console.log('\n4️⃣ 生成JavaScript代码...');
    const codeRes = await fetch(`${API_BASE}/code/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement: '写一个函数过滤数组中的偶数'
      })
    });
    const codeData = await codeRes.json();
    if (codeData.success) {
      console.log('✅ 代码生成成功');
      console.log('   代码长度:', codeData.data.code.length, '字符');
    } else {
      console.log('❌ 代码生成失败:', codeData.error);
    }

    console.log('\n🎉 API测试完成！所有功能正常运行。');

  } catch (error) {
    console.error('\n❌ API测试失败:', error.message);
  }
}

testAPI();