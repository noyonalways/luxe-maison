const STOREFRONT_URL = (import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000').replace(/\/$/, '');

export function resolveStorefrontAssetUrl(url: string): string {
  if (!url.trim()) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${STOREFRONT_URL}${url}`;
  return url;
}
