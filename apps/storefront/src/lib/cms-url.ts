export function getCmsUrl(): string {
  return process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:5173';
}
