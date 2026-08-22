import { useEffect } from 'react';

const SITE_URL = 'https://campora-seven.vercel.app';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta({ title, description, canonicalPath, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) setMeta('name', 'description', description);

    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalPath) {
      if (canonical) canonical.remove();
    } else {
      const href = `${SITE_URL}${canonicalPath}`;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = href;
    }
  }, [title, description, canonicalPath, noindex]);
}
