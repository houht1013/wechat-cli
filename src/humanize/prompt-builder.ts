import { AI_PATTERNS, INTENSITY_DESC, getPatternsByCategory, getAllCategories } from './patterns.js';
import type { Intensity, PatternCategory } from './patterns.js';

export interface HumanizeRequest {
  content: string;
  intensity: Intensity;
  focusCategories?: PatternCategory[];
  preserveStyle?: string;
  includeScore: boolean;
}

export interface HumanizeResult {
  prompt: string;
  intensity: Intensity;
  focus_patterns: PatternCategory[];
  instructions: {
    output_format: string;
    scoring?: string;
  };
}

export function buildHumanizePrompt(req: HumanizeRequest): HumanizeResult {
  const categories = req.focusCategories?.length ? req.focusCategories : getAllCategories();
  const patterns = getPatternsByCategory(categories);

  const patternList = patterns.map(g =>
    `【${g.name}】\n${g.patterns.map(p => `- ${p}`).join('\n')}`
  ).join('\n\n');

  const preserveBlock = req.preserveStyle
    ? `\n\n⚠️ 重要：本文使用「${req.preserveStyle}」写作风格。请保留该风格的刻意特征（如特定的节奏感、短句风格、修辞手法），只消除 AI 生成的机械痕迹，不要破坏作者有意为之的风格选择。`
    : '';

  const scoreBlock = req.includeScore
    ? `\n\n在改写完成后，请在文末用以下格式附加质量评分：

---
## 质量评分
- 直接性（是否开门见山）：X/10
- 节奏感（长短句是否交替自然）：X/10
- 信任度（是否避免空泛断言）：X/10
- 真实性（是否有具体细节支撑）：X/10
- 精炼度（是否消除冗余表达）：X/10
- 总分：XX/50`
    : '';

  const prompt = `你是一位中文写作专家，擅长识别和消除 AI 生成文本的典型痕迹，让文章读起来像真人自然写作。

## 任务
对以下文章进行人性化改写。

## 改写强度
${INTENSITY_DESC[req.intensity]}

## 需要识别和消除的 AI 痕迹模式

${patternList}${preserveBlock}

## 改写原则
1. 保留原文的核心观点和论据，改变表达方式
2. 用具体的词替换抽象的万能词
3. 打破机械的排比和并列结构，让节奏有变化
4. 删除不提供信息量的修饰和过渡
5. 让每一句话都有存在的理由
6. 保持 Markdown 格式

## 输出要求
直接输出改写后的完整文章，使用 Markdown 格式。不要输出任何解释或对比说明。${scoreBlock}

---

## 原文

${req.content}`;

  return {
    prompt,
    intensity: req.intensity,
    focus_patterns: categories,
    instructions: {
      output_format: '输出改写后的完整文章，保持 Markdown 格式',
      ...(req.includeScore ? { scoring: '在文末附加 5 维质量评分（直接性/节奏/信任度/真实性/精炼度，各 10 分）' } : {}),
    },
  };
}
