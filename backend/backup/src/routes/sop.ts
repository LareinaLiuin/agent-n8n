import { Router } from 'express';
import { SOPController } from '../controllers/sop.controller';

const router = Router();
const sopController = new SOPController();

// 创建SOP
router.post('/', sopController.createSOP);

// 生成SOP建议
router.post('/generate', sopController.generateSOP);

// 获取所有SOP列表
router.get('/', sopController.getAllSOPs);

// 获取SOP详情
router.get('/:sopId', sopController.getSOP);

// 更新SOP
router.put('/:sopId', sopController.updateSOP);

// 添加步骤
router.post('/:sopId/steps', sopController.addStep);

// 更新步骤
router.put('/:sopId/steps/:stepId', sopController.updateStep);

// 删除步骤
router.delete('/:sopId/steps/:stepId', sopController.deleteStep);

export { router as sopRoutes };