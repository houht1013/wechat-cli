import type { Theme } from './types.js';
import { wechatTheme } from './wechat.js';
import { githubTheme } from './github.js';
import { mediumTheme } from './medium.js';
import { notionTheme } from './notion.js';
import { claudeTheme } from './claude.js';
import { sspaiTheme } from './sspai.js';
import { inkTheme } from './ink.js';
import { appleTheme } from './apple.js';
import { bloombergTheme } from './bloomberg.js';
import { coffeeTheme } from './coffee.js';
import { copperTheme } from './copper.js';
import { cyberpunkTheme } from './cyberpunk.js';
import { draculaTheme } from './dracula.js';
import { forestTheme } from './forest.js';
import { glacierTheme } from './glacier.js';
import { lavenderTheme } from './lavender.js';
import { linearTheme } from './linear.js';
import { nytTheme } from './nyt.js';
import { mintTheme } from './mint.js';
import { monokaiTheme } from './monokai.js';
import { nordTheme } from './nord.js';
import { oceanTheme } from './ocean.js';
import { pastelTheme } from './pastel.js';
import { retroTheme } from './retro.js';
import { sakuraTheme } from './sakura.js';
import { solarizedTheme } from './solarized.js';
import { stripeTheme } from './stripe.js';
import { sunsetTheme } from './sunset.js';
import { workspaceTheme } from './workspace.js';

export type { Theme, ThemeStyles } from './types.js';

const builtinThemes: Theme[] = [
  wechatTheme,
  githubTheme,
  mediumTheme,
  notionTheme,
  claudeTheme,
  sspaiTheme,
  inkTheme,
  appleTheme,
  bloombergTheme,
  coffeeTheme,
  copperTheme,
  cyberpunkTheme,
  draculaTheme,
  forestTheme,
  glacierTheme,
  lavenderTheme,
  linearTheme,
  nytTheme,
  mintTheme,
  monokaiTheme,
  nordTheme,
  oceanTheme,
  pastelTheme,
  retroTheme,
  sakuraTheme,
  solarizedTheme,
  stripeTheme,
  sunsetTheme,
  workspaceTheme,
];

const themeMap = new Map<string, Theme>();
for (const theme of builtinThemes) {
  themeMap.set(theme.id, theme);
}

export function getTheme(id: string): Theme | undefined {
  return themeMap.get(id);
}

export function getBuiltinThemes(): Theme[] {
  return builtinThemes;
}

export function getThemeIds(): string[] {
  return builtinThemes.map(t => t.id);
}

export function isBuiltinTheme(id: string): boolean {
  return themeMap.has(id);
}
