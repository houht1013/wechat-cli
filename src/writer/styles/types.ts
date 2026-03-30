export type InputType = 'idea' | 'fragment' | 'outline' | 'title';
export type ArticleLength = 'short' | 'medium' | 'long';

export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  lengthGuide: Record<ArticleLength, string>;

  voice: {
    tone: string;
    perspective: string;
    vocabulary: string;
  };

  structure: {
    hook: string;
    body: string;
    ending: string;
  };

  formatting: {
    bold: string;
    code: string;
    list: string;
    blockquote: string;
  };

  /** The core writing prompt template. Placeholders: {{INPUT}}, {{LENGTH}}, {{INPUT_TYPE}} */
  writingPrompt: string;

  /** Title formula suggestions */
  titleFormulas: string[];
}
