import { Router } from 'express';
import { ValidationController } from '../controllers/validation.controller';

const router = Router();
const validationController = new ValidationController();

// 验证工作流
router.post('/workflow', validationController.validateWorkflow);

// 验证节点配置
router.post('/node', validationController.validateNodeConfig);

// 获取验证规则
router.get('/rules', validationController.getValidationRules);

export { router as validateRoutes };