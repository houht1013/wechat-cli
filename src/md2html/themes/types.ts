export interface ThemeStyles {
  container: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  p: string;
  strong: string;
  em: string;
  a: string;
  ul: string;
  ol: string;
  li: string;
  blockquote: string;
  code: string;
  pre: string;
  table: string;
  th: string;
  td: string;
  tr_even: string;
  hr: string;
  img: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  styles: ThemeStyles;
  codeTheme?: string;
}
