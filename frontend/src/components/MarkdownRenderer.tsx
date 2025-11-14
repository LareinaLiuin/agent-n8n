import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 简单的Markdown渲染器
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // 简单的Markdown解析和渲染
  const renderMarkdown = (text: string): React.ReactElement[] => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentListItems: string[] = [];
    let inList = false;
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 处理代码块
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          elements.push(
            <pre key={`code-${i}`} className="markdown-code-block">
              <code className={`language-${codeBlockLanguage}`}>{codeBlockContent}</code>
            </pre>
          );
          codeBlockContent = '';
          codeBlockLanguage = '';
          inCodeBlock = false;
        } else {
          // 开始代码块
          codeBlockLanguage = line.substring(3).trim();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      // 处理列表
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          inList = true;
          currentListItems = [];
        }
        currentListItems.push(line.trim().substring(2));
        continue;
      } else if (inList && line.trim() === '') {
        // 空行，继续列表
        continue;
      } else if (inList) {
        // 结束列表，渲染列表项
        if (currentListItems.length > 0) {
          elements.push(
            <ul key={`list-${i}`} className="markdown-list">
              {currentListItems.map((item, index) => (
                <li key={index} className="markdown-list-item">{item}</li>
              ))}
            </ul>
          );
        }
        currentListItems = [];
        inList = false;
      }

      // 处理标题
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="markdown-h1">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="markdown-h2">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="markdown-h3">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="markdown-h4">
            {line.substring(5)}
          </h4>
        );
      } else if (line.startsWith('##### ')) {
        elements.push(
          <h5 key={`h5-${i}`} className="markdown-h5">
            {line.substring(6)}
          </h5>
        );
      } else if (line.startsWith('###### ')) {
        elements.push(
          <h6 key={`h6-${i}`} className="markdown-h6">
            {line.substring(7)}
          </h6>
        );
      } else if (line === '') {
        elements.push(<br key={`br-${i}`} />);
      } else {
        // 处理普通文本，包括粗体和斜体
        let processedLine = line;
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processedLine = processedLine.replace(/`(.*?)`/g, '<code>$1</code>');

        elements.push(
          <p key={`p-${i}`} className="markdown-p" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      }
    }

    // 处理未关闭的列表
    if (inList && currentListItems.length > 0) {
      elements.push(
        <ul key="list-final" className="markdown-list">
          {currentListItems.map((item, index) => (
            <li key={index} className="markdown-list-item">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return <div className={className}>{renderMarkdown(content)}</div>;
};