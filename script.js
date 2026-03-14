// ================== CONST & STATE ==================
const totalFiles = 612; // آخرین فایل Quran612.jpg = صفحه 610
const GITHUB_BASE = 'https://raw.githubusercontent.com/YBakhtiar/quranh/main/';
let currentFile = 3; // پیش‌فرض فایل 3 (صفحه 1 = فاتحه)
let isDownloaded = false;
let objectUrls = { right: null, left: null };

// PWA
let deferredPrompt = null;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// zoom & pan
let currentScale = 1;
let translateX = 0, translateY = 0;
let lastTranslateX = 0, lastTranslateY = 0;
let initialPinchDistance = null;
let isPanning = false;
let lastTapTime = 0;
let hasMoved = false;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg error:', err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone) {
        document.getElementById('installPwaBtn').style.display = 'flex';
    }
});

// ================== ترجمه (فقط فارسی و عربی) ==================
const translations = {
    fa: {
        splashSubtitle: 'به نرم‌افزار قرآن کریم خوش آمدید',
        splashContinue: 'ادامه مطالعه',
        splashJuz: 'فهرست اجزاء و سوره‌ها',
        splashLink: 'پیشنهادات و نظریات',
        juzContinue: 'ادامه تلاوت',
        settingsTitle: 'تنظیمات',
        themeLabel: 'تم اصلی',
        languageLabel: 'زبان',
        appearanceLabel: 'ظاهر',
        storageLabel: 'مدیریت حافظه',
        deleteBtn: 'حذف فایل‌های آفلاین',
        closeBtn: 'بستن',
        downloadTitle: 'انتخاب کیفیت',
        downloadDesc: 'کیفیت مناسب خود را انتخاب کنید:',
        standard: 'استاندارد (۷۰ مگابایت)',
        standardSub: 'مناسب موبایل و تبلت',
        hq: 'کیفیت بالا (۵۰۰ مگابایت)',
        hqSub: 'مناسب کامپیوتر و صفحات بزرگ',
        cancel: 'لغو',
        ok: 'باشه',
        confirmDeleteTitle: 'تأیید',
        confirmDeleteMsg: 'تمام فایل‌های دانلود شده حذف میشوند. ادامه می‌دهید؟',
        confirmDownloadTitle: 'دانلود آفلاین',
        confirmDownloadMsg: 'فایل‌های آفلاین حدود {size} حجم دارد. ادامه می‌دهید؟',
        page: 'صفحه',
        tabJuz: 'اجزاء',
        tabSurah: 'سوره‌ها',
        juzPrefix: 'جزء ',
        surahPrefix: '',
        menuTitle: 'فهرست اجزاء و سوره‌ها',
        settingsBtnTitle: 'تنظیمات',
        downloadBtnTitle: 'دانلود آفلاین',
        fullscreenTitle: 'تمام صفحه',
        themeZard: 'زرد',
        themeAbi: 'آبی',
        dayMode: 'حالت روز',
        nightMode: 'حالت شب',
        lightBg: 'پس‌زمینه روشن',
        darkBg: 'پس‌زمینه تیره',
        downloadSuccess: 'دانلود با موفقیت انجام شد!',
        deleteSuccess: 'فایل‌های آفلاین حذف شدند.',
        downloadError: 'خطا در دانلود!',
        deleteError: 'خطا در حذف!',
        installTitle: 'نصب روی دستگاه',
        installBtn: 'نصب اپلیکیشن',
        installInstr1: '<strong>اندروید و کروم:</strong> دکمه نصب یا "Install App".',
        installInstr2: '<strong>آیفون/آیپد:</strong> "Add to Home Screen".',
        installInstr3: '<strong>دسکتاپ:</strong> آیکون نصب در نوار آدرس.',
    },
    ar: {
        splashSubtitle: 'مرحباً بكم في تطبيق القرآن الكريم',
        splashContinue: 'متابعة القراءة',
        splashJuz: 'قائمة الأجزاء والسور',
        splashLink: 'اقتراحات وملاحظات',
        juzContinue: 'متابعة التلاوة',
        settingsTitle: 'الإعدادات',
        themeLabel: 'السمة الرئيسية',
        languageLabel: 'اللغة',
        appearanceLabel: 'المظهر',
        storageLabel: 'إدارة التخزين',
        deleteBtn: 'حذف الملفات المحفوظة',
        closeBtn: 'إغلاق',
        downloadTitle: 'اختيار الجودة',
        downloadDesc: 'اختر الجودة المناسبة:',
        standard: 'قياسي (۷۰ م.ب)',
        standardSub: 'مناسب للجوال والتابلت',
        hq: 'جودة عالية (۵۰۰ م.ب)',
        hqSub: 'مناسب للكمبيوتر والشاشات الكبيرة',
        cancel: 'إلغاء',
        ok: 'موافق',
        confirmDeleteTitle: 'تأكيد',
        confirmDeleteMsg: 'سيتم حذف جميع الملفات التي تم تنزيلها. هل تريد المتابعة؟',
        confirmDownloadTitle: 'تنزيل للاستخدام دون اتصال',
        confirmDownloadMsg: 'الملفات غير المتصلة بالإنترنت بحجم {size}. هل تريد المتابعة؟',
        page: 'صفحة',
        tabJuz: 'الأجزاء',
        tabSurah: 'السور',
        juzPrefix: 'جزء ',
        surahPrefix: '',
        menuTitle: 'قائمة الأجزاء والسور',
        settingsBtnTitle: 'الإعدادات',
        downloadBtnTitle: 'تحميل دون اتصال',
        fullscreenTitle: 'ملء الشاشة',
        themeZard: 'الأصفر',
        themeAbi: 'الأزرق',
        dayMode: 'وضع النهار',
        nightMode: 'وضع الليل',
        lightBg: 'خلفية فاتحة',
        darkBg: 'خلفية داكنة',
        downloadSuccess: 'تم التحميل بنجاح!',
        deleteSuccess: 'تم حذف الملفات غير المتصلة.',
        downloadError: 'خطأ في التحميل!',
        deleteError: 'خطأ في الحذف!',
        installTitle: 'تثبيت على الجهاز',
        installBtn: 'تثبيت التطبيق',
        installInstr1: '<strong>أندرويد وكروم:</strong> زر التثبيت أو "Install App".',
        installInstr2: '<strong>آيفون/آيباد:</strong> "Add to Home Screen".',
        installInstr3: '<strong>سطح المكتب:</strong> أيقونة التثبيت في شريط العنوان.',
    }
};

let currentLang = localStorage.getItem('quran-language') || 'fa';
if (!['fa', 'ar'].includes(currentLang)) currentLang = 'fa';

function formatNumber(num) {
    if (currentLang === 'fa') {
        return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    } else {
        return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('quran-language', lang);
    applyTranslations();
    updateLangButtons();
    rebuildSurahGrid();
    updateTitles();
    updateThemeToggleButton();
    updateDarkUIToggleButton();
}

function applyTranslations() {
    const t = translations[currentLang];
    document.getElementById('splashSubtitle').textContent = t.splashSubtitle;
    document.getElementById('splashContinueText').textContent = t.splashContinue;
    document.getElementById('splashJuzText').textContent = t.splashJuz;
    document.getElementById('splashLinkText').textContent = t.splashLink;
    document.getElementById('juzContinueText').textContent = t.juzContinue;
    document.getElementById('settingsTitle').textContent = t.settingsTitle;
    document.getElementById('themeLabel').textContent = t.themeLabel;
    document.getElementById('languageLabel').textContent = t.languageLabel;
    document.getElementById('appearanceLabel').textContent = t.appearanceLabel;
    document.getElementById('storageLabel').textContent = t.storageLabel;
    document.getElementById('deleteBtnText').textContent = t.deleteBtn;
    document.getElementById('closeBtnText').textContent = t.closeBtn;
    document.getElementById('downloadTitle').textContent = t.downloadTitle;
    document.getElementById('downloadDesc').textContent = t.downloadDesc;
    document.getElementById('standardText').textContent = t.standard;
    document.getElementById('standardSub').textContent = t.standardSub;
    document.getElementById('hqText').textContent = t.hq;
    document.getElementById('hqSub').textContent = t.hqSub;
    document.getElementById('cancelText').textContent = t.cancel;
    document.getElementById('tabJuzBtn').textContent = t.tabJuz;
    document.getElementById('tabSurahBtn').textContent = t.tabSurah;
    // نصب
    document.getElementById('installTitle').textContent = t.installTitle;
    document.getElementById('installBtnText').textContent = t.installBtn;
    document.getElementById('installInstr1').innerHTML = t.installInstr1;
    document.getElementById('installInstr2').innerHTML = t.installInstr2;
    document.getElementById('installInstr3').innerHTML = t.installInstr3;
}

function updateLangButtons() {
    document.getElementById('langFa').classList.toggle('active', currentLang === 'fa');
    document.getElementById('langAr').classList.toggle('active', currentLang === 'ar');
}

function updateTitles() {
    const t = translations[currentLang];
    document.getElementById('btnMenu').title = t.menuTitle;
    document.getElementById('btnSettings').title = t.settingsBtnTitle;
    document.getElementById('btnDownload').title = t.downloadBtnTitle;
    document.getElementById('btnFullscreen').title = t.fullscreenTitle;
    document.querySelector('#themeZardBtn span').textContent = t.themeZard;
    document.querySelector('#themeAbiBtn span').textContent = t.themeAbi;
}

// ================== دیالوگ سفارشی ==================
function showDialogConfirm(message, title) {
    return new Promise(function(resolve) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="overlay-backdrop"></div>
            <div class="dialog-card">
                <div class="dialog-title">${title}</div>
                <div class="dialog-message">${message}</div>
                <div class="dialog-actions">
                    <button class="dialog-btn dialog-btn-cancel" data-action="cancel">${translations[currentLang].cancel}</button>
                    <button class="dialog-btn dialog-btn-ok" data-action="ok">${translations[currentLang].ok}</button>
                </div>
            </div>
        `;
        function cleanup(result) {
            overlay.remove();
            resolve(result);
        }
        overlay.querySelector('[data-action="ok"]').addEventListener('click', () => cleanup(true));
        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => cleanup(false));
        overlay.querySelector('.overlay-backdrop').addEventListener('click', () => cleanup(false));
        document.body.appendChild(overlay);
    });
}

function showDialogAlert(message, title) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="overlay-backdrop"></div>
            <div class="dialog-card">
                <div class="dialog-title">${title}</div>
                <div class="dialog-message">${message}</div>
                <div class="dialog-actions" style="justify-content:center;">
                    <button class="dialog-btn dialog-btn-ok" data-action="ok">${translations[currentLang].ok}</button>
                </div>
            </div>
        `;
        overlay.querySelector('[data-action="ok"]').addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
        overlay.querySelector('.overlay-backdrop').addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
        document.body.appendChild(overlay);
    });
}

// ================== تم اصلی ==================
let currentThemeStyle = localStorage.getItem('quran-theme-style') || 'zard';
let currentThemeMode = localStorage.getItem('quran-theme-mode') || 'day';

function applyTheme() {
    document.body.classList.remove('theme-zard', 'theme-abi', 'night-mode', 'dark-ui');
    document.body.classList.add(`theme-${currentThemeStyle}`);
    if (currentThemeMode === 'night') {
        document.body.classList.add('night-mode');
    } else if (currentThemeMode === 'dark-ui') {
        document.body.classList.add('dark-ui');
    }
    const meta = document.getElementById('theme-color-meta');
    if (currentThemeStyle === 'abi') {
        if (currentThemeMode === 'night') meta.setAttribute('content', '#0b1424');
        else if (currentThemeMode === 'dark-ui') meta.setAttribute('content', '#1a2538');
        else meta.setAttribute('content', '#f0f7ff');
    } else {
        if (currentThemeMode === 'night') meta.setAttribute('content', '#0F1923');
        else if (currentThemeMode === 'dark-ui') meta.setAttribute('content', '#1A2538');
        else meta.setAttribute('content', '#FDF8F0');
    }
    updateThemeToggleButton();
    updateDarkUIToggleButton();
    updateThemeStyleButtons();
}

function setThemeStyle(style) {
    currentThemeStyle = style;
    localStorage.setItem('quran-theme-style', style);
    applyTheme();
}

function setThemeMode(mode) {
    currentThemeMode = mode;
    localStorage.setItem('quran-theme-mode', mode);
    applyTheme();
}

function toggleThemeMode() {
    if (currentThemeMode === 'day') setThemeMode('night');
    else if (currentThemeMode === 'night') setThemeMode('day');
    else setThemeMode('day');
}

function toggleDarkUI() {
    if (currentThemeMode === 'night') return;
    if (currentThemeMode === 'dark-ui') setThemeMode('day');
    else setThemeMode('dark-ui');
}

function updateThemeToggleButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const t = translations[currentLang];
    if (currentThemeMode === 'night') {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></g></svg> ${t.dayMode}`;
    } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79"/></svg> ${t.nightMode}`;
    }
}

function updateDarkUIToggleButton() {
    const btn = document.getElementById('darkUiToggle');
    if (!btn) return;
    const t = translations[currentLang];
    if (currentThemeMode === 'night') {
        btn.style.display = 'none';
        return;
    }
    btn.style.display = 'flex';
    if (currentThemeMode === 'dark-ui') {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg> ${t.lightBg}`;
        btn.classList.add('accent');
    } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg> ${t.darkBg}`;
        btn.classList.remove('accent');
    }
}

function updateThemeStyleButtons() {
    document.getElementById('themeZardBtn').classList.toggle('active', currentThemeStyle === 'zard');
    document.getElementById('themeAbiBtn').classList.toggle('active', currentThemeStyle === 'abi');
}

// ================== توابع کمکی ==================
function getPageFromFile(fileNumber) {
    return fileNumber - 2;
}

// ================== مدیریت صفحات و کش ==================
async function loadPageImage(imgId, fileNumber, side) {
    const img = document.getElementById(imgId);
    if (!img) return;
    if (objectUrls[side]) { URL.revokeObjectURL(objectUrls[side]); objectUrls[side] = null; }
    const fileName = 'Quran' + String(fileNumber).padStart(3, '0') + '.jpg';
    const urlPath = 'images/' + fileName;
    try {
        const cache = await caches.open('quran-cache-v1');
        const response = await cache.match(urlPath);
        if (response) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            objectUrls[side] = objUrl;
            img.src = objUrl;
        } else {
            img.src = urlPath;
        }
    } catch {
        img.src = urlPath;
    }
}

function updatePages() {
    resetZoom();
    const isMobile = window.innerWidth <= 768;
    const rightW = document.getElementById('rightWrapper');
    const leftW = document.getElementById('leftWrapper');

    if (isMobile) {
        loadPageImage('rightPage', currentFile, 'right');
        leftW.style.display = 'none';
        rightW.style.display = 'flex';
    } else {
        let rightFile = (currentFile % 2 !== 0) ? currentFile : currentFile - 1;
        let leftFile = rightFile + 1;
        loadPageImage('rightPage', rightFile, 'right');
        if (leftFile <= totalFiles) {
            loadPageImage('leftPage', leftFile, 'left');
            leftW.style.display = 'flex';
        } else {
            leftW.style.display = 'none';
        }
        rightW.style.display = 'flex';
        if (currentFile % 2 === 0) currentFile = rightFile;
    }
    localStorage.setItem('lastQuranFile', currentFile.toString());
    if (window.location.protocol !== 'file:') history.replaceState(null, null, '#' + currentFile);
}

function resetZoom() {
    currentScale = 1;
    translateX = 0; translateY = 0;
    lastTranslateX = 0; lastTranslateY = 0;
    applyTransform(true);
}
function applyTransform(smooth) {
    const rightW = document.getElementById('rightWrapper');
    const leftW = document.getElementById('leftWrapper');
    const t = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    [rightW, leftW].forEach(w => {
        if (w) {
            w.style.transition = smooth ? 'transform 0.3s ease-out' : 'none';
            w.style.transform = t;
        }
    });
}

function nextPage() {
    let step = window.innerWidth <= 768 ? 1 : 2;
    if (currentFile + step <= totalFiles) currentFile += step;
    else if (currentFile < totalFiles) currentFile++;
    else return;
    updatePages();
}
function prevPage() {
    let step = window.innerWidth <= 768 ? 1 : 2;
    if (currentFile - step >= 1) currentFile -= step;
    else if (currentFile > 1) currentFile--;
    else return;
    updatePages();
}

// ================== دانلود و کش ==================
async function startDownload(quality) {
    closeOverlay('downloadOverlay');
    let sizeText = quality === 'hq' ? '۵۰۰ مگابایت' : '۷۰ مگابایت';
    let msg = translations[currentLang].confirmDownloadMsg.replace('{size}', sizeText);
    let confirmed = await showDialogConfirm(msg, translations[currentLang].confirmDownloadTitle);
    if (!confirmed) return;

    const dlBtn = document.getElementById('btnDownload');
    const progress = document.getElementById('progressPill');
    dlBtn.style.pointerEvents = 'none';
    dlBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor"/></svg>';
    progress.style.display = 'block';
    progress.textContent = 'در حال دانلود...';

    try {
        const cache = await caches.open('quran-cache-v1');
        let downloaded = 0;
        const batch = 10;
        for (let i = 3; i <= totalFiles; i += batch) {
            const promises = [];
            for (let j = 0; j < batch && i + j <= totalFiles; j++) {
                let fileNum = i + j;
                let fileName = 'Quran' + String(fileNum).padStart(3, '0') + '.jpg';
                let cacheKey = 'images/' + fileName;
                let fetchUrl = quality === 'hq' ? GITHUB_BASE + fileName : cacheKey;
                promises.push(
                    fetch(fetchUrl, { cache: 'reload' })
                        .then(resp => resp.ok ? cache.put(cacheKey, resp.clone()) : null)
                        .catch(() => null)
                );
            }
            await Promise.all(promises);
            downloaded += batch;
            progress.textContent = 'پیشرفت: ' + formatNumber(Math.min(downloaded, totalFiles-2)) + ' از ' + formatNumber(totalFiles-2);
        }
        setDownloadedUI();
        await showDialogAlert(translations[currentLang].downloadSuccess, translations[currentLang].confirmDownloadTitle);
        updatePages();
    } catch (err) {
        progress.textContent = '❌ خطا در دانلود';
        await showDialogAlert(translations[currentLang].downloadError, translations[currentLang].confirmDownloadTitle);
        dlBtn.style.pointerEvents = 'auto';
        dlBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg>';
    }
}

function setDownloadedUI() {
    const btn = document.getElementById('btnDownload');
    const prog = document.getElementById('progressPill');
    if (btn) { btn.style.display = 'none'; btn.classList.add('done'); }
    if (prog) prog.style.display = 'none';
    isDownloaded = true;
}
function resetDownloadedUI() {
    const btn = document.getElementById('btnDownload');
    if (btn) {
        btn.style.display = 'flex';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>';
        btn.style.pointerEvents = 'auto';
        btn.classList.remove('done');
    }
    isDownloaded = false;
}

async function deleteOfflineFiles() {
    let confirmed = await showDialogConfirm(translations[currentLang].confirmDeleteMsg, translations[currentLang].confirmDeleteTitle);
    if (!confirmed) return;
    const prog = document.getElementById('progressPill');
    prog.style.display = 'block';
    prog.textContent = 'در حال حذف...';
    try {
        await caches.delete('quran-cache-v1');
        resetDownloadedUI();
        prog.style.display = 'none';
        await showDialogAlert(translations[currentLang].deleteSuccess, translations[currentLang].confirmDeleteTitle);
        updatePages();
    } catch {
        prog.style.display = 'none';
        await showDialogAlert(translations[currentLang].deleteError, translations[currentLang].confirmDeleteTitle);
    }
}

// ================== مودال‌ها ==================
function openOverlay(id) { document.getElementById(id).classList.add('active'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('active'); }

function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (document.exitFullscreen) document.exitFullscreen();
}

// ================== تولید JUZ grid ==================
function buildJuzGrid() {
    const grid = document.getElementById('juzGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        let startFile;
        if (i === 1) startFile = 3;
        else if (i === 30) startFile = 588;
        else startFile = 4 + ((i - 1) * 20);
        const btn = document.createElement('button');
        btn.className = 'juz-item';
        btn.textContent = translations[currentLang].juzPrefix + formatNumber(i);
        btn.onclick = () => {
            let target = startFile;
            if (window.innerWidth > 768 && target % 2 === 0) target--;
            currentFile = target;
            updatePages();
            closeOverlay('juzOverlay');
        };
        grid.appendChild(btn);
    }
}

// ================== داده‌های سوره‌ها ==================
const surahPages = [
    1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,322,331,342,350,359,366,376,385,396,404,411,415,418,428,434,440,445,452,458,467,477,483,489,495,498,502,506,511,515,518,520,523,526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,567,569,571,573,576,578,580,582,584,586,587,589,590,591,592,594,595,596,597,597,598,600,600,601,602,602,603,603,604,604,605,605,606,606,607,607,607,608,608,608,609,609,609,610,610,610
];
const surahFiles = surahPages.map(p => p + 2);
const surahNamesAr = [
    "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
];
const surahNamesFa = [
    "فاتحه","بقره","آل‌عمران","نساء","مائده","انعام","اعراف","انفال","توبه","یونس","هود","یوسف","رعد","ابراهیم","حجر","نحل","اسراء","کهف","مریم","طه","انبیاء","حج","مؤمنون","نور","فرقان","شعراء","نمل","قصص","عنکبوت","روم","لقمان","سجده","احزاب","سبأ","فاطر","یس","صافات","ص","زمر","غافر","فصلت","شوری","زخرف","دخان","جاثیه","احقاف","محمد","فتح","حجرات","ق","ذاریات","طور","نجم","قمر","الرحمن","واقعه","حدید","مجادله","حشر","ممتحنه","صف","جمعه","منافقون","تغابن","طلاق","تحریم","ملک","قلم","حاقه","معارج","نوح","جن","مزمل","مدثر","قیامت","انسان","مرسلات","نبأ","نازعات","عبس","تکویر","انفطار","مطففین","انشقاق","بروج","طارق","اعلی","غاشیه","فجر","بلد","شمس","لیل","ضحی","شرح","تین","علق","قدر","بینه","زلزله","عادیات","قارعه","تکاثر","عصر","همزه","فیل","قریش","ماعون","کوثر","کافرون","نصر","مسد","اخلاص","فلق","ناس"
];

function rebuildSurahGrid() {
    const grid = document.getElementById('surahGrid');
    grid.innerHTML = '';
    for (let i = 0; i < 114; i++) {
        const surahNumber = i + 1;
        const file = surahFiles[i];
        let name = (currentLang === 'fa') ? surahNamesFa[i] : surahNamesAr[i];
        const btn = document.createElement('button');
        btn.className = 'surah-item';
        btn.textContent = `${surahNumber}. ${name}`;
        btn.onclick = () => {
            let target = file;
            if (window.innerWidth > 768 && target % 2 === 0) target--;
            currentFile = target;
            updatePages();
            closeOverlay('juzOverlay');
        };
        grid.appendChild(btn);
    }
}

// ================== Event Listeners ==================
document.getElementById('btnMenu').addEventListener('click', () => openOverlay('juzOverlay'));
document.getElementById('btnSettings').addEventListener('click', () => openOverlay('settingsOverlay'));
document.getElementById('btnDownload').addEventListener('click', () => openOverlay('downloadOverlay'));
document.getElementById('btnFullscreen').addEventListener('click', toggleFullScreen);
document.getElementById('navRight').addEventListener('click', prevPage);
document.getElementById('navLeft').addEventListener('click', nextPage);
document.getElementById('splashContinue').addEventListener('click', () => closeOverlay('splashOverlay'));
document.getElementById('splashJuzList').addEventListener('click', () => { closeOverlay('splashOverlay'); openOverlay('juzOverlay'); });
document.getElementById('juzContinueBtn').addEventListener('click', () => closeOverlay('juzOverlay'));

// تنظیمات
document.getElementById('themeToggle').addEventListener('click', toggleThemeMode);
document.getElementById('darkUiToggle').addEventListener('click', toggleDarkUI);
document.getElementById('settingsClose').addEventListener('click', () => closeOverlay('settingsOverlay'));
document.getElementById('themeZardBtn').addEventListener('click', () => setThemeStyle('zard'));
document.getElementById('themeAbiBtn').addEventListener('click', () => setThemeStyle('abi'));

// زبان
document.getElementById('langFa').addEventListener('click', () => setLanguage('fa'));
document.getElementById('langAr').addEventListener('click', () => setLanguage('ar'));

// دانلود
document.getElementById('dlStandard').addEventListener('click', () => startDownload('standard'));
document.getElementById('dlHQ').addEventListener('click', () => startDownload('hq'));
document.getElementById('downloadClose').addEventListener('click', () => closeOverlay('downloadOverlay'));

// نصب PWA
document.getElementById('installPwaBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('User response to install prompt:', outcome);
    deferredPrompt = null;
    document.getElementById('installPwaBtn').style.display = 'none';
});

// مدیریت حافظه
const storageToggle = document.getElementById('storageToggle');
const deleteContainer = document.getElementById('deleteOptionContainer');
storageToggle.addEventListener('click', () => {
    if (deleteContainer.style.display === 'none') {
        deleteContainer.style.display = 'block';
    } else {
        deleteContainer.style.display = 'none';
    }
});
document.getElementById('deleteOfflineBtn').addEventListener('click', deleteOfflineFiles);

// تب‌ها
const tabJuz = document.getElementById('tabJuzBtn');
const tabSurah = document.getElementById('tabSurahBtn');
const contentJuz = document.getElementById('juzTabContent');
const contentSurah = document.getElementById('surahTabContent');
tabJuz.addEventListener('click', () => {
    tabJuz.classList.add('active');
    tabSurah.classList.remove('active');
    contentJuz.style.display = 'block';
    contentSurah.style.display = 'none';
});
tabSurah.addEventListener('click', () => {
    tabSurah.classList.add('active');
    tabJuz.classList.remove('active');
    contentSurah.style.display = 'block';
    contentJuz.style.display = 'none';
    rebuildSurahGrid();
});

// بستن مودال‌ها با کلیک روی backdrop
['juzOverlay', 'settingsOverlay', 'downloadOverlay'].forEach(id => {
    const el = document.getElementById(id);
    el.querySelector('.overlay-backdrop').addEventListener('click', () => closeOverlay(id));
});

// ================== رویدادهای لمسی ==================
const swipeArea = document.getElementById('swipeArea');
let touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0, touchStartTime = 0;
swipeArea.addEventListener('touchstart', e => {
    if (e.touches.length >= 2) {
        initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        isPanning = false;
    } else if (e.touches.length === 1) {
        touchstartX = e.touches[0].clientX; touchstartY = e.touches[0].clientY;
        touchStartTime = Date.now(); hasMoved = false;
        if (currentScale > 1) isPanning = true;
    }
}, { passive: false });
swipeArea.addEventListener('touchmove', e => {
    e.preventDefault(); hasMoved = true;
    if (e.touches.length >= 2 && initialPinchDistance) {
        let dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        currentScale = Math.min(Math.max(1, currentScale * (dist / initialPinchDistance)), 4);
        initialPinchDistance = dist;
        applyTransform(false);
    } else if (e.touches.length === 1 && isPanning && currentScale > 1) {
        translateX = lastTranslateX + (e.touches[0].clientX - touchstartX);
        translateY = lastTranslateY + (e.touches[0].clientY - touchstartY);
        applyTransform(false);
    }
}, { passive: false });
swipeArea.addEventListener('touchend', e => {
    if (e.touches.length > 0) {
        initialPinchDistance = null;
        if (e.touches.length === 1 && currentScale > 1) {
            touchstartX = e.touches[0].clientX; touchstartY = e.touches[0].clientY;
            lastTranslateX = translateX; lastTranslateY = translateY; isPanning = true;
        }
        return;
    }
    initialPinchDistance = null;
    if (isPanning) { lastTranslateX = translateX; lastTranslateY = translateY; isPanning = false; }
    if (!hasMoved) {
        let now = Date.now();
        if (now - lastTapTime < 300 && now - lastTapTime > 0) { resetZoom(); lastTapTime = 0; return; }
        lastTapTime = now;
    } else lastTapTime = 0;

    if (currentScale <= 1.05 && e.changedTouches.length === 1 && hasMoved) {
        touchendX = e.changedTouches[0].clientX; touchendY = e.changedTouches[0].clientY;
        let diffX = Math.abs(touchendX - touchstartX), diffY = Math.abs(touchendY - touchstartY);
        let timeDiff = Date.now() - touchStartTime;
        if (diffX > 80 && diffX > diffY * 2 && timeDiff < 600) {
            if (touchendX > touchstartX) nextPage(); else prevPage();
        }
    }
}, { passive: false });

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); nextPage(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); prevPage(); }
});

window.addEventListener('resize', updatePages);
window.addEventListener('orientationchange', () => setTimeout(updatePages, 50));

// ================== مقداردهی اولیه ==================
(function init() {
    applyTheme();
    setLanguage(currentLang);
    buildJuzGrid();
    rebuildSurahGrid();
    let saved = localStorage.getItem('lastQuranFile');
    if (saved && !isNaN(parseInt(saved))) currentFile = parseInt(saved);
    updatePages();
    caches.open('quran-cache-v1').then(cache => {
        cache.match('images/Quran003.jpg').then(res => { if (res) setDownloadedUI(); });
    });
})();
