import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';
import { ApiResponse, SOP, SOPStep } from '../types';

// 内存存储（生产环境应该使用数据库）
const sops = new Map<string, SOP>();

// 使用OpenAIServiceManager管理OpenAI服务
const openaiServiceManager = new OpenAIService();

export class SOPController {
  // 创建SOP
  async createSOP(req: Request, res: Response) {
    try {
      const { title, description, goal } = req.body;

      if (!title || !goal) {
        const response: ApiResponse = {
          success: false,
          error: '标题和目标不能为空',
        };
        return res.status(400).json(response);
      }

      const sopId = `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const sop: SOP = {
        id: sopId,
        title,
        description: description || '',
        goal,
        steps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      sops.set(sopId, sop);

      const response: ApiResponse = {
        success: true,
        data: { sop },
        message: 'SOP创建成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Create SOP error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'SOP创建失败',
      };
      res.status(500).json(response);
    }
  }

  // 生成SOP建议
  async generateSOP(req: Request, res: Response) {
    try {
      const { userInput } = req.body;

      if (!userInput) {
        const response: ApiResponse = {
          success: false,
          error: '用户输入不能为空',
        };
        return res.status(400).json(response);
      }

      const sopSuggestion = await openaiServiceManager!.generateSOP(userInput);

      const response: ApiResponse = {
        success: true,
        data: sopSuggestion,
        message: 'SOP建议生成成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Generate SOP error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'SOP生成失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取SOP详情
  async getSOP(req: Request, res: Response) {
    try {
      const { sopId } = req.params;

      const sop = sops.get(sopId);
      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP不存在',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: { sop },
      };

      res.json(response);
    } catch (error) {
      console.error('Get SOP error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取SOP失败',
      };
      res.status(500).json(response);
    }
  }

  // 更新SOP
  async updateSOP(req: Request, res: Response) {
    try {
      const { sopId } = req.params;
      const updates = req.body;

      const sop = sops.get(sopId);
      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP不存在',
        };
        return res.status(404).json(response);
      }

      const updatedSOP: SOP = {
        ...sop,
        ...updates,
        id: sopId, // 确保ID不被覆盖
        updatedAt: new Date(),
      };

      sops.set(sopId, updatedSOP);

      const response: ApiResponse = {
        success: true,
        data: { sop: updatedSOP },
        message: 'SOP更新成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Update SOP error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'SOP更新失败',
      };
      res.status(500).json(response);
    }
  }

  // 添加SOP步骤
  async addStep(req: Request, res: Response) {
    try {
      const { sopId } = req.params;
      const { title, description, type } = req.body;

      if (!title || !type) {
        const response: ApiResponse = {
          success: false,
          error: '步骤标题和类型不能为空',
        };
        return res.status(400).json(response);
      }

      const sop = sops.get(sopId);
      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP不存在',
        };
        return res.status(404).json(response);
      }

      const step: SOPStep = {
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description: description || '',
        type,
        order: sop.steps.length + 1,
      };

      sop.steps.push(step);
      sop.updatedAt = new Date();

      // 保存更新后的SOP
      sops.set(sopId, sop);

      const response: ApiResponse = {
        success: true,
        data: { sop, step },
        message: '步骤添加成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Add step error:', error);
      const response: ApiResponse = {
        success: false,
        error: '步骤添加失败',
      };
      res.status(500).json(response);
    }
  }

  // 更新SOP步骤
  async updateStep(req: Request, res: Response) {
    try {
      const { sopId, stepId } = req.params;
      const updates = req.body;

      const sop = sops.get(sopId);
      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP不存在',
        };
        return res.status(404).json(response);
      }

      const stepIndex = sop.steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) {
        const response: ApiResponse = {
          success: false,
          error: '步骤不存在',
        };
        return res.status(404).json(response);
      }

      const updatedStep: SOPStep = {
        ...sop.steps[stepIndex],
        ...updates,
        id: stepId, // 确保ID不被覆盖
      };

      sop.steps[stepIndex] = updatedStep;
      sop.updatedAt = new Date();

      sops.set(sopId, sop);

      const response: ApiResponse = {
        success: true,
        data: { sop, step: updatedStep },
        message: '步骤更新成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Update step error:', error);
      const response: ApiResponse = {
        success: false,
        error: '步骤更新失败',
      };
      res.status(500).json(response);
    }
  }

  // 删除SOP步骤
  async deleteStep(req: Request, res: Response) {
    try {
      const { sopId, stepId } = req.params;

      const sop = sops.get(sopId);
      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP不存在',
        };
        return res.status(404).json(response);
      }

      const stepIndex = sop.steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) {
        const response: ApiResponse = {
          success: false,
          error: '步骤不存在',
        };
        return res.status(404).json(response);
      }

      sop.steps.splice(stepIndex, 1);

      // 重新排序剩余步骤
      sop.steps.forEach((step, index) => {
        step.order = index + 1;
      });

      sop.updatedAt = new Date();
      sops.set(sopId, sop);

      const response: ApiResponse = {
        success: true,
        data: { sop },
        message: '步骤删除成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Delete step error:', error);
      const response: ApiResponse = {
        success: false,
        error: '步骤删除失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取所有SOP列表
  async getAllSOPs(req: Request, res: Response) {
    try {
      const sopList = Array.from(sops.values()).map(sop => ({
        id: sop.id,
        title: sop.title,
        description: sop.description,
        goal: sop.goal,
        stepCount: sop.steps.length,
        createdAt: sop.createdAt,
        updatedAt: sop.updatedAt,
      }));

      const response: ApiResponse = {
        success: true,
        data: { sops: sopList },
      };

      res.json(response);
    } catch (error) {
      console.error('Get all SOPs error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取SOP列表失败',
      };
      res.status(500).json(response);
    }
  }
}