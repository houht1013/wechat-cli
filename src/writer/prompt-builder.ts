import type { WritingStyle, InputType, ArticleLength } from './styles/types.js';
import { getStyle } from './styles/index.js';

export interface WriteRequest {
  styleId: string;
  input: string;
  inputType: InputType;
  length: ArticleLength;
}

export interface WriteResult {
  style: string;
  prompt: string;
  metadata: {
    input_type: InputType;
    suggested_length: ArticleLength;
    length_guide: string;
    title_formulas: string[];
  };
}

const INPUT_TYPE_DESC: Record<InputType, string> = {
  idea: '一个想法或观点',
  fragment: '一段文字片段或草稿',
  outline: '一份文章大纲',
  title: '一个文章标题',
};

export function buildWritePrompt(req: WriteRequest): WriteResult {
  const style = getStyle(req.styleId);
  if (!style) {
    throw new Error(`未知写作风格: ${req.styleId}。使用 --list-styles 查看可用风格`);
  }

  const prompt = style.writingPrompt
    .replace(/\{\{INPUT\}\}/g, req.input)
    .replace(/\{\{INPUT_TYPE\}\}/g, INPUT_TYPE_DESC[req.inputType])
    .replace(/\{\{LENGTH\}\}/g, style.lengthGuide[req.length]);

  return {
    style: req.styleId,
    prompt,
    metadata: {
      input_type: req.inputType,
      suggested_length: req.length,
      length_guide: style.lengthGuide[req.length],
      title_formulas: style.titleFormulas,
    },
  };
}
