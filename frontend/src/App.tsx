import { ChatInterface } from './components/ChatInterface';

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1>n8n 智能体构建助手</h1>
        <p>通过智能对话，从想法到完整工作流的实现</p>
      </div>

      <ChatInterface />

      <div className="input-container" style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
        <p> powered by AI ❤️ 让智能体构建变得简单有趣</p>
      </div>
    </div>
  );
}

export default App;
