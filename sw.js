/* Service worker của app: chỉ để cài app ra màn hình chính và nhận thông báo (không lưu cache trang). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) {}
  const d = p.data || {}, n = p.notification || {};
  const call = d.kind === 'call';
  const title = d.title || n.title || 'Tiếng Anh Siêu Mất Gốc';
  const opt = {
    body: d.body || n.body || '',
    tag: d.tag || 'lop', renotify: true,
    icon: 'icon-192.png', badge: 'badge-72.png',
    vibrate: call ? [500, 200, 500, 200, 500, 200, 900] : [200, 100, 200],
    requireInteraction: call,
    data: { url: d.url || './' },
    actions: call ? [{ action: 'join', title: 'Vào lớp' }] : []
  };
  e.waitUntil(self.registration.showNotification(title, opt));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) {
        try { c.postMessage({ t: 'notif', url }); } catch (_) {}
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
