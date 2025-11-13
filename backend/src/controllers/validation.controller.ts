import { Request, Response } from 'express';
import { ApiResponse, SOP } from '../types';

export class ValidationController {
  // 验证工作流
  async validateWorkflow(req: Request, res: Response) {
    try {
      const { sop } = req.body;

      if (!sop) {
        const response: ApiResponse = {
          success: false,
          error: 'SOP数据不能为空',
        };
        return res.status(400).json(response);
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // 基础验证
      if (!sop.title || sop.title.trim() === '') {
        errors.push('SOP标题不能为空');
      }

      if (!sop.goal || sop.goal.trim() === '') {
        errors.push('SOP目标不能为空');
      }

      if (!sop.steps || sop.steps.length === 0) {
        errors.push('SOP至少需要一个步骤');
      }

      // 步骤验证
      if (sop.steps && sop.steps.length > 0) {
        // 检查是否有触发器
        const hasTrigger = sop.steps.some((step: any) => step.type === 'trigger');
        if (!hasTrigger) {
          warnings.push('建议添加一个触发器步骤来启动工作流');
        }

        // 检查步骤顺序
        const sortedSteps = [...sop.steps].sort((a: any, b: any) => a.order - b.order);
        for (let i = 0; i < sortedSteps.length; i++) {
          if (sortedSteps[i].order !== i + 1) {
            errors.push(`步骤 "${sortedSteps[i].title}" 的序号不正确`);
          }
        }

        // 检查每个步骤的完整性
        sop.steps.forEach((step: any, index: number) => {
          if (!step.title || step.title.trim() === '') {
            errors.push(`步骤 ${index + 1} 的标题不能为空`);
          }

          if (!step.type) {
            errors.push(`步骤 "${step.title}" 的类型不能为空`);
          }
        });

        // 检查逻辑流程
        const triggerCount = sop.steps.filter((step: any) => step.type === 'trigger').length;
        if (triggerCount > 1) {
          warnings.push('工作流通常只需要一个触发器');
        }

        const actionCount = sop.steps.filter((step: any) => step.type === 'action').length;
        if (actionCount === 0 && sop.steps.length > 1) {
          warnings.push('工作流没有包含任何操作步骤');
        }
      }

      // 生成优化建议
      if (sop.steps && sop.steps.length > 0) {
        // 检查是否可以添加条件分支
        const hasCondition = sop.steps.some((step: any) => step.type === 'condition');
        if (sop.steps.length > 3 && !hasCondition) {
          suggestions.push('考虑添加条件分支来处理不同的情况');
        }

        // 检查是否可以添加错误处理
        const hasErrorHandling = sop.description.toLowerCase().includes('error') ||
                               sop.goal.toLowerCase().includes('error');
        if (!hasErrorHandling && sop.steps.length > 2) {
          suggestions.push('考虑添加错误处理步骤来提高工作流的健壮性');
        }

        // 检查步骤描述的完整性
        const incompleteSteps = sop.steps.filter((step: any) =>
          !step.description || step.description.length < 10
        );
        if (incompleteSteps.length > 0) {
          suggestions.push('为每个步骤添加更详细的描述，以便更好地理解和维护');
        }
      }

      const isValid = errors.length === 0;

      const response: ApiResponse = {
        success: true,
        data: {
          isValid,
          errors,
          warnings,
          suggestions,
          summary: {
            totalSteps: sop.steps?.length || 0,
            errorCount: errors.length,
            warningCount: warnings.length,
            suggestionCount: suggestions.length,
          }
        },
        message: '工作流验证完成',
      };

      res.json(response);
    } catch (error) {
      console.error('Validate workflow error:', error);
      const response: ApiResponse = {
        success: false,
        error: '工作流验证失败',
      };
      res.status(500).json(response);
    }
  }

  // 验证n8n节点配置
  async validateNodeConfig(req: Request, res: Response) {
    try {
      const { nodeType, config } = req.body;

      if (!nodeType) {
        const response: ApiResponse = {
          success: false,
          error: '节点类型不能为空',
        };
        return res.status(400).json(response);
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // 根据节点类型进行验证
      switch (nodeType) {
        case 'httpRequest':
          if (!config.url) {
            errors.push('HTTP请求节点需要配置URL');
          }
          if (config.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method)) {
            errors.push('HTTP请求方法不正确');
          }
          break;

        case 'webhook':
          if (!config.path) {
            errors.push('Webhook节点需要配置路径');
          }
          if (config.httpMethod && !['GET', 'POST', 'PUT', 'DELETE'].includes(config.httpMethod)) {
            warnings.push('Webhook HTTP方法可能不支持');
          }
          break;

        case 'set':
          if (!config.values || config.values.length === 0) {
            errors.push('Set节点需要配置至少一个值');
          }
          break;

        case 'if':
          if (!config.conditions || config.conditions.length === 0) {
            errors.push('IF节点需要配置条件');
          }
          break;

        case 'function':
          if (!config.functionCode) {
            errors.push('Function节点需要配置JavaScript代码');
          }
          break;

        default:
          warnings.push(`未知的节点类型: ${nodeType}`);
      }

      // 通用验证
      if (config && typeof config === 'object') {
        // 检查是否有空字符串值
        Object.entries(config).forEach(([key, value]) => {
          if (typeof value === 'string' && value.trim() === '') {
            warnings.push(`配置项 "${key}" 的值为空`);
          }
        });
      }

      const isValid = errors.length === 0;

      const response: ApiResponse = {
        success: true,
        data: {
          isValid,
          errors,
          warnings,
          nodeType,
        },
        message: '节点配置验证完成',
      };

      res.json(response);
    } catch (error) {
      console.error('Validate node config error:', error);
      const response: ApiResponse = {
        success: false,
        error: '节点配置验证失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取验证规则说明
  async getValidationRules(req: Request, res: Response) {
    try {
      const rules = {
        sop: {
          required: ['title', 'goal'],
          recommended: ['description', 'steps'],
          stepTypes: ['trigger', 'action', 'condition', 'data_processing', 'output'],
        },
        steps: {
          required: ['title', 'type'],
          recommended: ['description'],
          order: 'Must be sequential starting from 1',
        },
        workflow: {
          bestPractices: [
            '每个工作流应该有明确的触发器',
            '步骤顺序应该逻辑清晰',
            '考虑添加错误处理机制',
            '为复杂的工作流添加条件分支',
            '提供详细的步骤描述'
          ]
        },
        nodes: {
          http: {
            required: ['url'],
            optional: ['method', 'headers', 'body'],
          },
          webhook: {
            required: ['path'],
            optional: ['httpMethod', 'responseMode'],
          },
          set: {
            required: ['values'],
            optional: [],
          },
          if: {
            required: ['conditions'],
            optional: [],
          },
          function: {
            required: ['functionCode'],
            optional: [],
          },
        }
      };

      const response: ApiResponse = {
        success: true,
        data: { rules },
        message: '验证规则获取成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Get validation rules error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取验证规则失败',
      };
      res.status(500).json(response);
    }
  }
}