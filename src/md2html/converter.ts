import { Marked, type Tokens } from 'marked';
import hljs from 'highlight.js';
import type { Theme, ThemeStyles } from './themes/index.js';
import { getTheme } from './themes/index.js';

export interface ConvertOptions {
  theme?: string | Theme;
  /** Enable code highlighting (default: true) */
  highlight?: boolean;
}

export function convertMarkdown(markdown: string, options: ConvertOptions = {}): string {
  const theme = resolveTheme(options.theme || 'wechat');
  const styles = theme.styles;
  const shouldHighlight = options.highlight !== false;

  const marked = new Marked();
  let trIndex = 0;

  marked.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const text = this.parser.parseInline(tokens);
        const tag = `h${depth}` as keyof ThemeStyles;
        const style = styles[tag] || styles.h4;
        return `<${tag} style="${style}">${text}</${tag}>\n`;
      },

      paragraph({ tokens }: Tokens.Paragraph) {
        const text = this.parser.parseInline(tokens);
        return `<p style="${styles.p}">${text}</p>\n`;
      },

      strong({ tokens }: Tokens.Strong) {
        const text = this.parser.parseInline(tokens);
        return `<strong style="${styles.strong}">${text}</strong>`;
      },

      em({ tokens }: Tokens.Em) {
        const text = this.parser.parseInline(tokens);
        return `<em style="${styles.em}">${text}</em>`;
      },

      link({ href, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens);
        return `<a href="${href}" style="${styles.a}">${text}</a>`;
      },

      image({ href, title, text }: Tokens.Image) {
        const alt = text ? ` alt="${text}"` : '';
        const titleAttr = title ? ` title="${title}"` : '';
        return `<img src="${href}"${alt}${titleAttr} style="${styles.img}" />\n`;
      },

      list({ ordered, items }: Tokens.List) {
        const tag = ordered ? 'ol' : 'ul';
        const style = ordered ? styles.ol : styles.ul;
        const body = items.map(item => this.listitem(item)).join('');
        return `<${tag} style="${style}">${body}</${tag}>\n`;
      },

      listitem({ tokens }: Tokens.ListItem) {
        const text = this.parser.parse(tokens);
        return `<li style="${styles.li}">${text}</li>\n`;
      },

      blockquote({ tokens }: Tokens.Blockquote) {
        const body = this.parser.parse(tokens);
        return `<blockquote style="${styles.blockquote}">${body}</blockquote>\n`;
      },

      code({ text, lang }: Tokens.Code) {
        let highlighted: string;
        if (shouldHighlight && lang && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(text, { language: lang }).value;
        } else if (shouldHighlight) {
          highlighted = hljs.highlightAuto(text).value;
        } else {
          highlighted = escapeHtml(text);
        }

        // Convert hljs class-based spans to inline styles (WeChat strips class attributes)
        highlighted = convertHljsClassesToInlineStyles(highlighted, isDarkTheme(theme));

        return renderCodeBlock(highlighted, lang || '', styles.pre);
      },

      codespan({ text }: Tokens.Codespan) {
        return `<code style="${styles.code}">${text}</code>`;
      },

      table({ header, rows }: Tokens.Table) {
        trIndex = 0;
        const thead = '<thead>' + this.tablerow({ text: header.map(cell => this.tablecell(cell)).join('') }) + '</thead>';
        const bodyRows = rows.map(row => {
          trIndex++;
          const rowStyle = trIndex % 2 === 0 ? ` style="${styles.tr_even}"` : '';
          return `<tr${rowStyle}>${row.map(cell => this.tablecell(cell)).join('')}</tr>`;
        }).join('\n');
        const tbody = bodyRows ? `<tbody>${bodyRows}</tbody>` : '';
        return `<table style="${styles.table}">${thead}${tbody}</table>\n`;
      },

      tablerow({ text }: { text: string }) {
        return `<tr>${text}</tr>\n`;
      },

      tablecell({ tokens, header, align }: Tokens.TableCell) {
        const tag = header ? 'th' : 'td';
        const style = header ? styles.th : styles.td;
        const alignStyle = align ? `; text-align: ${align}` : '';
        const text = this.parser.parseInline(tokens);
        return `<${tag} style="${style}${alignStyle}">${text}</${tag}>`;
      },

      hr() {
        return `<hr style="${styles.hr}" />\n`;
      },
    },
  });

  const html = marked.parse(markdown) as string;
  return `<section style="${styles.container}">${html}</section>`;
}

function resolveTheme(themeInput: string | Theme): Theme {
  if (typeof themeInput === 'string') {
    const theme = getTheme(themeInput);
    if (!theme) {
      throw new Error(`未知主题: ${themeInput}。使用 --list-themes 查看可用主题`);
    }
    return theme;
  }
  return themeInput;
}

function renderCodeBlock(code: string, lang: string, preStyle: string): string {
  const bgMatch = preStyle.match(/background-color:\s*([^;]+)/);
  const bgColor = bgMatch ? bgMatch[1].trim() : '#f6f8fa';
  const bgIsDark = isColorDark(bgColor);
  const textColor = bgIsDark ? '#abb2bf' : '#383a42';
  const langColor = bgIsDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const headerBg = bgIsDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  // --- Header: macOS dots + lang label ---
  const dotStyle = (c: string) => `display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;background-color:${c};`;
  const header =
    `<section style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:${headerBg};">` +
    `<span>` +
    `<span style="${dotStyle('#ff5f57')}"></span>` +
    `<span style="${dotStyle('#febc2e')}"></span>` +
    `<span style="${dotStyle('#28c840')}"></span>` +
    `</span>` +
    (lang ? `<span style="font-size:12px;color:${langColor};">${lang}</span>` : '') +
    `</section>`;

  // --- Code body: each line as <span display:block> ---
  // Using <span> avoids WeChat injecting extra margin/padding like it does with <p>/<div>
  const font = 'Menlo,Consolas,Courier New,monospace';

  const lines = code.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  const linesHtml = lines.map(line => {
    // Convert leading spaces to &nbsp; pairs for indentation
    const indented = line
      .replace(/\t/g, '    ')
      .replace(/^ +/, m => '&nbsp;'.repeat(m.length));
    const content = indented || '<br>';
    return `<span style="display:block;font-family:${font};font-size:13px;line-height:26px;color:${textColor};">${content}</span>`;
  }).join('');

  // --- Assemble ---
  return (
    `<section style="margin:20px 0;border-radius:8px;overflow:hidden;background:${bgColor};">` +
    header +
    `<section style="padding:12px 16px;overflow-x:auto;">${linesHtml}</section>` +
    `</section>\n`
  );
}

function isColorDark(color: string): boolean {
  // Handle common formats: #hex, rgb(), rgba(), named colors
  let r = 0, g = 0, b = 0;

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else if (color.startsWith('rgb')) {
    const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else {
    // Assume light for named colors like "transparent"
    return false;
  }

  // Luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DARK_THEME_IDS = new Set([
  'linear', 'cyberpunk', 'dracula', 'monokai', 'nord', 'bloomberg',
  'copper', 'forest', 'ocean',
]);

function isDarkTheme(theme: Theme): boolean {
  return DARK_THEME_IDS.has(theme.id);
}

// hljs class → inline color mapping
// Light theme palette (GitHub-like)
const LIGHT_COLORS: Record<string, string> = {
  'hljs-keyword':    'color: #cf222e;',
  'hljs-built_in':   'color: #8250df;',
  'hljs-type':       'color: #8250df;',
  'hljs-literal':    'color: #0550ae;',
  'hljs-number':     'color: #0550ae;',
  'hljs-operator':   'color: #cf222e;',
  'hljs-punctuation':'color: #1f2328;',
  'hljs-property':   'color: #0550ae;',
  'hljs-regexp':     'color: #0a3069;',
  'hljs-string':     'color: #0a3069;',
  'hljs-char.escape':'color: #0550ae;',
  'hljs-subst':      'color: #1f2328;',
  'hljs-symbol':     'color: #0550ae;',
  'hljs-variable':   'color: #953800;',
  'hljs-variable.language': 'color: #cf222e;',
  'hljs-variable.constant': 'color: #0550ae;',
  'hljs-title':      'color: #8250df;',
  'hljs-title.class':'color: #8250df;',
  'hljs-title.class.inherited': 'color: #8250df;',
  'hljs-title.function': 'color: #8250df;',
  'hljs-params':     'color: #1f2328;',
  'hljs-comment':    'color: #6e7781; font-style: italic;',
  'hljs-doctag':     'color: #cf222e;',
  'hljs-meta':       'color: #6e7781;',
  'hljs-section':    'color: #0550ae; font-weight: bold;',
  'hljs-tag':        'color: #116329;',
  'hljs-name':       'color: #116329;',
  'hljs-attr':       'color: #0550ae;',
  'hljs-attribute':  'color: #0550ae;',
  'hljs-selector-id':    'color: #8250df;',
  'hljs-selector-class': 'color: #8250df;',
  'hljs-selector-attr':  'color: #0550ae;',
  'hljs-selector-pseudo':'color: #8250df;',
  'hljs-addition':   'color: #116329; background-color: #dafbe1;',
  'hljs-deletion':   'color: #82071e; background-color: #ffebe9;',
  'hljs-link':       'color: #0a3069; text-decoration: underline;',
  'hljs-template-tag':      'color: #cf222e;',
  'hljs-template-variable': 'color: #953800;',
};

// Dark theme palette (Monokai-like)
const DARK_COLORS: Record<string, string> = {
  'hljs-keyword':    'color: #f92672;',
  'hljs-built_in':   'color: #66d9ef;',
  'hljs-type':       'color: #66d9ef; font-style: italic;',
  'hljs-literal':    'color: #ae81ff;',
  'hljs-number':     'color: #ae81ff;',
  'hljs-operator':   'color: #f92672;',
  'hljs-punctuation':'color: #f8f8f2;',
  'hljs-property':   'color: #a6e22e;',
  'hljs-regexp':     'color: #e6db74;',
  'hljs-string':     'color: #e6db74;',
  'hljs-char.escape':'color: #ae81ff;',
  'hljs-subst':      'color: #f8f8f2;',
  'hljs-symbol':     'color: #ae81ff;',
  'hljs-variable':   'color: #fd971f;',
  'hljs-variable.language': 'color: #f92672;',
  'hljs-variable.constant': 'color: #ae81ff;',
  'hljs-title':      'color: #a6e22e;',
  'hljs-title.class':'color: #a6e22e;',
  'hljs-title.class.inherited': 'color: #66d9ef; font-style: italic;',
  'hljs-title.function': 'color: #a6e22e;',
  'hljs-params':     'color: #f8f8f2;',
  'hljs-comment':    'color: #75715e; font-style: italic;',
  'hljs-doctag':     'color: #f92672;',
  'hljs-meta':       'color: #75715e;',
  'hljs-section':    'color: #a6e22e; font-weight: bold;',
  'hljs-tag':        'color: #f92672;',
  'hljs-name':       'color: #f92672;',
  'hljs-attr':       'color: #a6e22e;',
  'hljs-attribute':  'color: #a6e22e;',
  'hljs-selector-id':    'color: #a6e22e;',
  'hljs-selector-class': 'color: #a6e22e;',
  'hljs-selector-attr':  'color: #66d9ef;',
  'hljs-selector-pseudo':'color: #a6e22e;',
  'hljs-addition':   'color: #a6e22e;',
  'hljs-deletion':   'color: #f92672;',
  'hljs-link':       'color: #66d9ef; text-decoration: underline;',
  'hljs-template-tag':      'color: #f92672;',
  'hljs-template-variable': 'color: #fd971f;',
};

function convertHljsClassesToInlineStyles(html: string, isDark: boolean): string {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  return html.replace(/<span class="([^"]+)">/g, (_match, classes: string) => {
    // Try exact match first, then first class
    let style = palette[classes];
    if (!style) {
      // Try individual classes (e.g. "hljs-title function_" → "hljs-title.function")
      const parts = classes.split(/\s+/);
      if (parts.length >= 2) {
        style = palette[`${parts[0]}.${parts[1]}`];
      }
      if (!style) {
        style = palette[parts[0]];
      }
    }

    if (style) {
      return `<span style="${style}">`;
    }
    // Fallback: remove class, keep span
    return '<span>';
  });
}
