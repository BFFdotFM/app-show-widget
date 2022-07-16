/** Fastly Image Optimizer CDN functions */

export function sizeImage(url, size) {
  return `${url}?width=${size}&height=${size}&fit=crop`;
}

export function srcSet(url) {
  return [100, 300, 500, 1000]
    .map(size => `${sizeImage(url, size)} ${size}w`)
    .join(',');
}
