import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

// 创建新会话
router.post('/session', chatController.createSession);

// 获取会话信息
router.get('/session/:sessionId', chatController.getSession);

// 删除会话
router.delete('/session/:sessionId', chatController.deleteSession);

// 发送消息
router.post('/message', chatController.sendMessage);

// 获取所有会话列表（调试用）
router.get('/sessions', chatController.getAllSessions);

export { router as chatRoutes };