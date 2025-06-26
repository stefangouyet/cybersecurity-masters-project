export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch((err) => console.error('Copy failed:', err));
}
