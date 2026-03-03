// نام کش را به v2 تغییر دادیم تا مرورگر مجبور شود فایل‌های جدید را جایگزین کند
const CACHE_NAME = 'quran-cache-v2';

// لیست فایل‌های حیاتی که باید در همان لحظه اول کش شوند
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './sw.js',
    // کش کردن لینک استایل فونت‌ها تا در حالت آفلاین صفحه گیر نکند
    'https://cdnjs.cloudflare.com/ajax/libs/vazirmatn/33.0.0/Vazirmatn-font-face.min.css',
    'https://cdn.fontcdn.ir/Font/Persian/Vazir/Vazir.css'
];

// 1. نصب سرویس ورکر و دانلود فایل‌های اصلی
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('در حال کش کردن فایل‌های اصلی...');
            return cache.addAll(CORE_ASSETS);
        })
    );
    // اجبار مرورگر به استفاده فوری از این سرویس ورکر جدید
    self.skipWaiting(); 
});

// 2. پاک کردن حافظه‌های قدیمی (نسخه v1) برای جلوگیری از تداخل
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('پاک کردن کش قدیمی:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. رهگیری درخواست‌ها (هوشمند)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // الف) اگر فایل در حافظه بود (مثل عکس‌هایی که کاربر با دکمه دانلود کرده)، همان را بده
            if (cachedResponse) {
                return cachedResponse;
            }

            // ب) اگر در حافظه نبود، سعی کن از اینترنت بگیری
            return fetch(event.request).then(networkResponse => {
                // فایل‌های جدیدی که از نت می‌گیری (مثل فایل اصلی فونت ttf) را هم خودکار کش کن
                if (event.request.method === 'GET' && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // ج) اگر اینترنت قطع بود و کاربر آدرس سایت را زد، حتماً فایل index.html را به او نشان بده
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
