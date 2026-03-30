// Common WeChat API response
export interface WechatApiResponse {
  errcode?: number;
  errmsg?: string;
}

// Access Token
export interface AccessTokenResponse extends WechatApiResponse {
  access_token: string;
  expires_in: number;
}

// Draft - article_type
export type ArticleType = 'news' | 'newspic';

// 图文消息 (news) - 传统公众号文章
export interface DraftNewsArticle {
  article_type?: 'news';
  title: string;
  author?: string;
  digest?: string;
  content: string;
  content_source_url?: string;
  thumb_media_id: string;
  need_open_comment?: 0 | 1;
  only_fans_can_comment?: 0 | 1;
  pic_crop_235_1?: string; // 封面裁剪 2.35:1 坐标 X1_Y1_X2_Y2
  pic_crop_1_1?: string;   // 封面裁剪 1:1 坐标 X1_Y1_X2_Y2
}

// 图片消息 (newspic) - 公众号小绿书
export interface DraftNewspicArticle {
  article_type: 'newspic';
  title: string;
  content: string; // 仅支持纯文本和部分特殊功能标签（如商品），不支持HTML
  need_open_comment?: 0 | 1;
  only_fans_can_comment?: 0 | 1;
  image_info: {
    image_list: Array<{
      image_media_id: string; // 永久素材 media_id
    }>;
  };
  cover_info?: {
    crop_percent_list: Array<{
      ratio: '1_1' | '16_9' | '2.35_1';
      x1: string;
      y1: string;
      x2: string;
      y2: string;
    }>;
  };
  product_info?: {
    footer_product_info: {
      product_key: string;
    };
  };
}

export type DraftArticle = DraftNewsArticle | DraftNewspicArticle;

export interface DraftItem {
  media_id: string;
  content: {
    news_item: DraftArticle[];
  };
  update_time: number;
}

export interface DraftListResponse extends WechatApiResponse {
  total_count: number;
  item_count: number;
  item: DraftItem[];
}

export interface DraftCreateResponse extends WechatApiResponse {
  media_id: string;
}

export interface PublishResponse extends WechatApiResponse {
  publish_id: string;
}

export interface PublishStatusResponse extends WechatApiResponse {
  publish_id: string;
  publish_status: 0 | 1 | 2 | 3; // 0=success, 1=publishing, 2=deleted, 3=failed
  article_id?: string;
  article_detail?: {
    count: number;
    item: Array<{
      idx: number;
      article_url: string;
    }>;
  };
  fail_idx?: number[];
}

// Media / Material
export interface MediaUploadResponse extends WechatApiResponse {
  type: string;
  media_id: string;
  created_at: number;
}

export interface PermanentMediaUploadResponse extends WechatApiResponse {
  media_id: string;
  url?: string;
}

export interface MediaCountResponse extends WechatApiResponse {
  voice_count: number;
  video_count: number;
  image_count: number;
  news_count: number;
}

export interface MediaListResponse extends WechatApiResponse {
  total_count: number;
  item_count: number;
  item: Array<{
    media_id: string;
    name?: string;
    update_time: number;
    url?: string;
  }>;
}

export interface UploadImgResponse extends WechatApiResponse {
  url: string;
}

// Stats
export interface StatsUserSummary {
  ref_date: string;
  user_source: number;
  new_user: number;
  cancel_user: number;
}

export interface StatsUserCumulate {
  ref_date: string;
  cumulate_user: number;
}

export interface StatsArticleSummary {
  ref_date: string;
  msgid: string;
  title: string;
  int_page_read_user: number;
  int_page_read_count: number;
  ori_page_read_user: number;
  ori_page_read_count: number;
  share_user: number;
  share_count: number;
  add_to_fav_user: number;
  add_to_fav_count: number;
}

export interface StatsResponse<T> extends WechatApiResponse {
  list: T[];
}
