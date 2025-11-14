import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';
import { ApiResponse } from '../types';

// 使用OpenAIServiceManager管理OpenAI服务
const openaiServiceManager = new OpenAIService();

export class CodeController {
  // 生成代码
  async generateCode(req: Request, res: Response) {
    try {
      const { requirement, context } = req.body;

      if (!requirement) {
        const response: ApiResponse = {
          success: false,
          error: '代码需求不能为空',
        };
        return res.status(400).json(response);
      }

      const codeResult = await openaiServiceManager!.generateJavaScriptCode(requirement, context);

      const response: ApiResponse = {
        success: true,
        data: codeResult,
        message: '代码生成成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Generate code error:', error);
      const response: ApiResponse = {
        success: false,
        error: '代码生成失败',
      };
      res.status(500).json(response);
    }
  }

  // 验证代码
  async validateCode(req: Request, res: Response) {
    try {
      const { code, language = 'javascript' } = req.body;

      if (!code) {
        const response: ApiResponse = {
          success: false,
          error: '代码内容不能为空',
        };
        return res.status(400).json(response);
      }

      // 简单的语法验证
      const errors: string[] = [];
      const warnings: string[] = [];

      try {
        if (language === 'javascript') {
          // 基本的JavaScript语法检查
          new Function(code);
        }
      } catch (syntaxError: any) {
        errors.push(`语法错误: ${syntaxError.message}`);
      }

      // 检查常见的代码问题
      if (code.includes('eval(')) {
        warnings.push('使用eval()可能存在安全风险');
      }

      if (code.includes('console.log') && !code.includes('console.log') === false) {
        warnings.push('生产环境中建议移除console.log语句');
      }

      const isValid = errors.length === 0;

      const response: ApiResponse = {
        success: true,
        data: {
          isValid,
          errors,
          warnings,
        },
        message: '代码验证完成',
      };

      res.json(response);
    } catch (error) {
      console.error('Validate code error:', error);
      const response: ApiResponse = {
        success: false,
        error: '代码验证失败',
      };
      res.status(500).json(response);
    }
  }

  // 格式化代码
  async formatCode(req: Request, res: Response) {
    try {
      const { code, language = 'javascript' } = req.body;

      if (!code) {
        const response: ApiResponse = {
          success: false,
          error: '代码内容不能为空',
        };
        return res.status(400).json(response);
      }

      // 简单的代码格式化
      let formattedCode = code;

      // 基本的JavaScript格式化规则
      formattedCode = formattedCode
        // 在大括号前后添加换行
        .replace(/{\s*/g, '{\n  ')
        .replace(/\s*}/g, '\n}')
        // 在分号后添加换行
        .replace(/;\s*/g, ';\n  ')
        // 清理多余的空行
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      const response: ApiResponse = {
        success: true,
        data: {
          formattedCode,
          originalCode: code,
        },
        message: '代码格式化完成',
      };

      res.json(response);
    } catch (error) {
      console.error('Format code error:', error);
      const response: ApiResponse = {
        success: false,
        error: '代码格式化失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取代码模板
  async getCodeTemplates(req: Request, res: Response) {
    try {
      const templates = [
        {
          id: 'http-request',
          name: 'HTTP请求处理',
          description: '处理HTTP请求响应',
          code: `// HTTP请求响应处理
const response = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Success',
    data: []
  })
};

return response;`,
        },
        {
          id: 'data-transformation',
          name: '数据转换',
          description: '数据格式转换和处理',
          code: `// 数据转换示例
const items = $input.all();
const transformedItems = items.map(item => {
  return {
    id: item.json.id,
    name: item.json.name,
    processed: true,
    timestamp: new Date().toISOString()
  };
});

return transformedItems;`,
        },
        {
          id: 'filter-data',
          name: '数据过滤',
          description: '根据条件过滤数据',
          code: `// 数据过滤示例
const items = $input.all();
const filteredItems = items.filter(item => {
  // 添加你的过滤条件
  return item.json.status === 'active' &&
         item.json.age >= 18;
});

return filteredItems;`,
        },
        {
          id: 'error-handling',
          name: '错误处理',
          description: '处理异常和错误情况',
          code: `// 错误处理示例
try {
  const result = someFunction();

  if (!result) {
    throw new Error('操作失败');
  }

  return {
    success: true,
    data: result
  };
} catch (error) {
  console.error('Error:', error.message);

  return {
    success: false,
    error: error.message
  };
}`,
        },
      ];

      const response: ApiResponse = {
        success: true,
        data: { templates },
        message: '代码模板获取成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Get code templates error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取代码模板失败',
      };
      res.status(500).json(response);
    }
  }
}