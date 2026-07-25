# نشر الموقع التعريفي (Al-Barq Website) — Static Build + CI/CD

هذا الدليل يشرح نشر `delivery-website` (موقع React + Vite ثابت بالكامل، بلا خادم
تشغيل) على **نفس الـ VPS الذي يشغّل `delivery-backend`**، عبر موقع **Static**
جديد في **CloudPanel**، باستخدام **GitHub Actions** لبناء ونسخ `dist/` تلقائياً.

هذا مستودع Git **منفصل** عن الباك-إند (تماماً كما أن `delivery-app` مستودعه
الخاص) — الموقع لا يُحوسَب بـ Docker ولا يحتاج قاعدة بيانات، فهو ملفات ثابتة
(HTML/CSS/JS) يخدمها nginx مباشرة عبر CloudPanel.

| البند | القيمة |
|---|---|
| نوع النشر | ملفات ثابتة (`vite build` → `dist/`)، لا Docker |
| الخادم | نفس VPS الباك-إند، موقع CloudPanel منفصل |
| الدومين | `barq-iq.site` (قيمة `VITE_SITE_URL` الحالية) |

---

## 1) التشغيل محلياً (للتجربة قبل النشر)

```bash
cd delivery-website
cp .env.example .env      # عدّل VITE_SITE_URL وبيانات التواصل حسب الحاجة
npm install
npm run dev                # يعمل على :5174، مع بروكسي /api → :4000 للباك-إند
```

فحص أن البناء الإنتاجي يعمل قبل أي دفع:

```bash
npm run typecheck && npm test && npm run build
npm run preview             # يعاين dist/ محلياً
```

---

## 2) رفع المشروع على GitHub (مستودع منفصل خاص بالموقع)

المجلد ليس مستودع git بعد. من داخل `delivery-website`:

```bash
git init -b main
git add .
git commit -m "chore: website CI/CD + legal pages"
git remote add origin git@github.com:<USERNAME>/<REPO>.git   # مثال: barq-website
git push -u origin main
```

> `.env` الحقيقي لن يُرفع (محمي بـ `.gitignore`). فقط `.env.example`.
> القيم الفعلية تُضبط لاحقاً كـ **GitHub Actions Variables** (القسم 5) — لا حاجة
> لملف `.env` على الخادم إطلاقاً، لأن هذا موقع ثابت يُبنى في CI لا يُشغَّل بعملية Node.

---

## 3) تجهيز CloudPanel (مرة واحدة)

على نفس لوحة CloudPanel التي تدير الباك-إند:

1. **أنشئ موقعاً جديداً** من نوع **Static** (أو Node.js فارغ يُستخدم فقط كحاوية
   لتقديم ملفات ثابتة إن لم يتوفر نوع Static)، ووجّه إليه الدومين
   `barq-iq.site` (و`www.barq-iq.site` إن رغبت).
2. لاحظ **Document Root** لهذا الموقع (عادة
   `/home/<user>/htdocs/barq-iq.site/`) — هذا هو المسار الذي سيُستخدَم لاحقاً
   كسر `WEBSITE_DEPLOY_PATH`.
3. فعّل شهادة **Let's Encrypt** من CloudPanel (تجديد تلقائي، كما في الباك-إند).
4. **أضف قاعدة SPA fallback** — ضروري كي لا يُعيد التحديث اليدوي على مسار مثل
   `/coverage` أو `/legal/terms` خطأ 404 حقيقياً. من إعدادات الموقع → Nginx
   (Vhost) في CloudPanel، أضف داخل `location /`:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```
   > ملف `public/_redirects` الموجود في المشروع مكتوب لـ Netlify/Cloudflare
   > Pages وليس له أي أثر خلف nginx — ابقِ عليه فقط لسهولة الانتقال لاستضافة
   > أخرى مستقبلاً؛ **قاعدة الـ nginx أعلاه هي التي تعمل فعلياً في هذا الإعداد.**
5. **(اختياري، أداء)** أضف Cache-Control طويل الأمد لمجلد `assets/` — كل ملف
   بناء يحمل بصمة (hash) في اسمه، فهو غير قابل للتغيير:
   ```nginx
   location /assets/ {
     add_header Cache-Control "public, max-age=31536000, immutable";
   }
   ```
6. تأكّد أن مستخدم SSH الذي سيُستخدَم في القسم التالي يملك صلاحية الكتابة على
   Document Root هذا (يمكن استخدام نفس مستخدم الباك-إند إن كانت صلاحياته تسمح
   بذلك، أو مستخدم CloudPanel مخصّص لهذا الموقع فقط — الأخير أفضل عزلاً).

---

## 4) أسرار GitHub Actions (Secrets)

من `Settings → Secrets and variables → Actions → Secrets` في مستودع الموقع:

| السر | الوصف |
|---|---|
| `VPS_HOST` | نفس قيمة الباك-إند — IP أو دومين السيرفر |
| `VPS_USER` | مستخدم SSH — نفس مستخدم الباك-إند أو مستخدم مخصّص لهذا الموقع |
| `VPS_SSH_KEY` | المفتاح الخاص كاملاً لهذا المستخدم (يُفضَّل مفتاح مخصّص للنشر) |
| `VPS_PORT` | منفذ SSH (اختياري، الافتراضي 22) |
| `WEBSITE_DEPLOY_PATH` | Document Root من الخطوة 3.2، مثلاً `/home/USER/htdocs/barq-iq.site` |

توليد مفتاح SSH مخصّص لنشر الموقع (يُفضَّل عدم إعادة استخدام مفتاح الباك-إند
حرفياً إن أردت عزلاً كاملاً بين الاثنين):

```bash
ssh-keygen -t ed25519 -f website_deploy_key -N ""
# انسخ website_deploy_key.pub إلى ~/.ssh/authorized_keys للمستخدم على السيرفر
# ضع محتوى website_deploy_key (الخاص) في السر VPS_SSH_KEY
```

---

## 5) متغيرات البناء (Variables — غير سرّية عمداً)

من `Settings → Secrets and variables → Actions → Variables` (وليس Secrets):
كل قيمة هنا تُضمَّن مباشرة في حزمة JS المرسَلة للمتصفح وقت `vite build` (انظر
`src/config/env.ts` و`.env.example`)، فوضعها في Secrets لا يزيد أي حماية
فعلية ويُصعّب فقط تتبعها.

| المتغيّر | مطلوب؟ | ملاحظة |
|---|---|---|
| `VITE_SITE_URL` | **نعم** | `https://barq-iq.site` — أساس canonical/OG/sitemap؛ البناء يفشل بدونه |
| `VITE_API_BASE_URL` | لا | فارغ = الموقع يستدعي `/api/v1` على نفس الدومين |
| `VITE_APP_STORE_URL` / `VITE_PLAY_STORE_URL` / `VITE_APK_DOWNLOAD_URL` | لا | فارغ = زر التحميل يظهر معطّلاً |
| `VITE_CONTACT_PHONE` / `VITE_CONTACT_EMAIL` / `VITE_WHATSAPP_NUMBER` | لا | فارغ = يختفي ذلك السطر من التذييل |
| `VITE_ANALYTICS_ID` | لا | فارغ = التحليلات معطّلة بالكامل (no-op) |
| `VITE_FEATURE_ORDER_TRACKING` / `VITE_FEATURE_LEAD_FORMS` | لا | `'true'`/`'false'` — تفعيل صفحة عندما يكون مسارها الخلفي جاهزاً |

---

## 6) دورة الـ CI/CD

عند كل `git push` إلى فرع `main`:

1. **test** — `npm ci && npm run typecheck && npm test` (13 اختباراً في
   `architecture.test.tsx`).
2. **build-and-deploy** — `npm run build` (يولّد `sitemap.xml` ثم يبني
   `dist/` بمتغيرات القسم 5)، ثم مزامنة `dist/` إلى `WEBSITE_DEPLOY_PATH` على
   الخادم عبر rsync فوق SSH (`--delete` يزيل أي ملف بناء سابق لم يعد
   مستخدَماً).

الـ Pull Requests تُشغّل مرحلة الاختبار فقط (لا بناء ولا نشر) — تماماً كما في
الباك-إند.

> **ملاحظة:** سكربت `npm run lint` معرَّف في `package.json` لكن ESLint غير
> مثبَّت ولا مُهيَّأ فعلياً في هذا المشروع بعد؛ لذلك تعمّدنا عدم تشغيله ضمن
> الـ workflow (كان سيفشل كل تشغيل). أضِفه لاحقاً كخطوة `test` إضافية بعد تثبيت
> وتهيئة ESLint إن رغبتم بذلك.

### التراجع لإصدار سابق (Rollback)

لا يوجد سجل صور هنا كما في الباك-إند (لا Docker) — إعادة نشر إصدار سابق تعني
إعادة تشغيل الـ workflow على commit سابق:

```bash
git push origin <old-commit-sha>:main --force-with-lease   # أو أعد التشغيل من تبويب Actions على commit قديم
```

أو، أسرع للطوارئ: عبر SSH على السيرفر، استرجع نسخة `dist/` محفوظة يدوياً إن
كانت متوفرة (لا يحتفظ هذا الإعداد بأرشيف تلقائي للإصدارات — أضيفوا ذلك لاحقاً
إن احتجتموه، مثلاً بنسخ `dist/` الحالي إلى `dist.previous/` كخطوة إضافية قبل
المزامنة).

---

## ملاحظات

- موقع ثابت بالكامل: لا Docker، لا قاعدة بيانات، لا عملية Node تعمل باستمرار —
  عزل تام عن الباك-إند باستثناء مشاركة الخادم الفعلي والدومين.
- إن استدعى الموقع الـ API مباشرة من متصفح الزائر (`VITE_API_BASE_URL`)، تأكّد
  أن `CORS_ORIGIN` في أسرار الباك-إند (`delivery-backend`) يشمل دومين هذا
  الموقع.
- ملفات `dist/` مبنية بأسماء تتضمّن hash المحتوى — نشر خاطئ لا "يكسر" نسخة
  قديمة يستخدمها متصفح مفتوح حالياً؛ أسوأ حالة هي 404 مؤقت لملف لم يعد
  موجوداً حتى يُعاد تحميل الصفحة.
