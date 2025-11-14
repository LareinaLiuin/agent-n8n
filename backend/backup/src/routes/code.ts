import { Router } from 'express';
import { CodeController } from '../controllers/code.controller';

const router = Router();
const codeController = new CodeController();

// 生成代码
router.post('/generate', codeController.generateCode);

// 验证代码
router.post('/validate', codeController.validateCode);

// 格式化代码
router.post('/format', codeController.formatCode);

// 获取代码模板
router.get('/templates', codeController.getCodeTemplates);

export { router as codeRoutes };