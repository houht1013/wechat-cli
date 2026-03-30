import type { WritingStyle } from './types.js';
import { techTutorialStyle } from './tech-tutorial.js';
import { productReviewStyle } from './product-review.js';
import { personalEssayStyle } from './personal-essay.js';
import { deepCommentaryStyle } from './deep-commentary.js';
import { newsBriefStyle } from './news-brief.js';

const styles: Map<string, WritingStyle> = new Map([
  [techTutorialStyle.id, techTutorialStyle],
  [productReviewStyle.id, productReviewStyle],
  [personalEssayStyle.id, personalEssayStyle],
  [deepCommentaryStyle.id, deepCommentaryStyle],
  [newsBriefStyle.id, newsBriefStyle],
]);

export function getStyle(id: string): WritingStyle | undefined {
  return styles.get(id);
}

export function getStyles(): WritingStyle[] {
  return Array.from(styles.values());
}

export function getStyleIds(): string[] {
  return Array.from(styles.keys());
}

export {
  techTutorialStyle,
  productReviewStyle,
  personalEssayStyle,
  deepCommentaryStyle,
  newsBriefStyle,
};
