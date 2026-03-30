export type PatternCategory = 'content' | 'language' | 'style' | 'filler' | 'collaboration';
export type Intensity = 'gentle' | 'medium' | 'aggressive';

export interface PatternGroup {
  category: PatternCategory;
  name: string;
  patterns: string[];
}

export const AI_PATTERNS: PatternGroup[] = [
  {
    category: 'content',
    name: '内容模式',
    patterns: [
      '过度强调某事的重要性（"这是至关重要的"、"不可或缺"）',
      '夸大意义（"具有划时代意义"、"彻底改变了"）',
      '宣传式语气（"令人振奋"、"令人瞩目"）',
      '模糊引用（"研究表明"、"众所周知"、"业内人士指出"）',
      '过度乐观的结论（"前景一片光明"、"未来可期"）',
    ],
  },
  {
    category: 'language',
    name: '语言模式',
    patterns: [
      'AI 高频词汇（赋能、助力、深入探讨、全方位、多维度、生态、闭环、抓手）',
      '否定式并列（"不仅...更是..."、"不只是...还是..."）',
      '三段式排比（连续三个相似句式）',
      '同义词机械堆叠（"快速、高效、便捷"）',
      '过度使用"的确"、"确实"、"毋庸置疑"等确认词',
      '段首千篇一律（"首先...其次...最后..."、"值得注意的是"）',
    ],
  },
  {
    category: 'style',
    name: '格式模式',
    patterns: [
      '破折号滥用（每段都有——插入语）',
      '加粗滥用（大量文字被加粗，失去重点）',
      'emoji 过度使用',
      '每段结尾都是感叹号或反问句',
    ],
  },
  {
    category: 'filler',
    name: '填充模式',
    patterns: [
      '废话连接词（"总的来说"、"综上所述"、"不难看出"）',
      '过度修饰（"在这个信息爆炸的时代"、"在当今快速发展的社会中"）',
      '泛化结论（"让我们拭目以待"、"相信未来会更好"）',
      '无意义过渡（"接下来让我们看看"、"下面我们来聊聊"）',
    ],
  },
  {
    category: 'collaboration',
    name: '协作痕迹',
    patterns: [
      '口语化填充（"好的"、"当然"、"没问题"开头）',
      '知识截止声明（"截至我所知"、"根据我的训练数据"）',
      '过度礼貌（"希望以上内容对您有所帮助"）',
      '自我指称（"作为一个AI"、"我被训练为"）',
    ],
  },
];

export const INTENSITY_DESC: Record<Intensity, string> = {
  gentle: '仅修改最明显的 AI 痕迹，如 AI 自我指称、知识截止声明、最突出的 AI 高频词。保留原文 90% 以上内容和结构。',
  medium: '平衡改写。替换 AI 高频词汇，消除典型排比和填充模式，调整段落节奏使其更自然。保留核心观点和论据，但重写表达方式。',
  aggressive: '深度重写。全面消除 AI 痕迹，重构句式和段落结构，使语言风格完全像人类自然写作。可能调整论述顺序和表达角度。',
};

export function getPatternsByCategory(categories: PatternCategory[]): PatternGroup[] {
  return AI_PATTERNS.filter(g => categories.includes(g.category));
}

export function getAllCategories(): PatternCategory[] {
  return AI_PATTERNS.map(g => g.category);
}
