export type PopupType = 'welcome' | 'discount' | 'campaign';
export type PopupTrigger = 'page_load' | 'exit_intent' | 'scroll_50' | 'delay_10s';

export interface PopupConfig {
  id: string;
  type: PopupType;
  enabled: boolean;
  title: string;
  message: string;
  discountCode: string;
  ctaText: string;
  ctaLink: string;
  trigger: PopupTrigger;
  priority: number;
}
