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

## 7) أخطاء شائعة (Troubleshooting)

هذا القسم موجود خصيصاً لأي AI/وكيل يقرأ هذا الملف لينفّذ أو يشخّص نشر هذا
الموقع — وثّقنا فيه أعطالاً حقيقية صادفتنا، بأعراضها بالضبط، عشان تُكتشف
بثوانٍ بدل ساعات.

### أ) الموقع يطلع صفحة سوداء/فاضية تماماً (لا خطأ ظاهر، لا محتوى)

**العرض:** فتح `barq-iq.site` يطلع خلفية داكنة فاضية بلا أي عنصر — لا هيدر، لا
نص، لا شي. الـ workflow نجح (أخضر) والملفات موجودة على السيرفر.

**السبب الأكيد:** `src/config/env.ts` يرمي (`throw`) استثناء عمداً إذا كانت
`VITE_SITE_URL` فاضية وقت الإنتاج (`resolveSiteUrl()`، انظر أعلى الملف) — وهذا
يصير أثناء تحميل `main.tsx` **قبل** ما React يعمل mount لأي شي، فتطلع الصفحة
فاضية تماماً بدل رسالة خطأ مرئية.

**سبب هذا بالتحديد 100% من المرات لحد الآن:** المتغيّر انضاف بتبويب
**Secrets** بدل تبويب **Variables** في
`Settings → Secrets and variables → Actions`. الاثنان منفصلان تماماً بـ
GitHub Actions ولا يشوف أحدهما الثاني: الـ workflow هنا يقرأ حصراً
`vars.VITE_SITE_URL` (انظر القسم 5) — فإذا انضاف كسر (`secrets.*`) يبقى فاضياً
من منظور `vars.*` والبناء يمر بصمت (لا فشل بالـ CI) لكن الحزمة النهائية تُبنى
بقيمة فاضية.

**كيف تتأكد بسرعة بدون الدخول لإعدادات GitHub (مفيد لوكيل بلا صلاحية أدمن):**
افحص الحزمة المنشورة فعلياً — إذا الدومين مو موجود جواها إطلاقاً فالمتغيّر لم
يصل للبناء:

```bash
JS=$(curl -s "https://barq-iq.site/" | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://barq-iq.site/assets/$JS" | grep -c "barq-iq.site"   # 0 = المتغيّر لم يصل، >0 = وصل بنجاح
```

**الحل:** أضف `VITE_SITE_URL` (والقيمة `https://barq-iq.site`) من تبويب
**Variables** بالتحديد، لا Secrets. لو كانت أضيفت غلط بـ Secrets، احذفها من هناك
(القيمة غير حساسة أصلاً — تُطبع بالحزمة النهائية بأي حال، فبقاؤها بالـ Secrets
لا يضر أمنياً، فقط يسبب اللبس).

**ملاحظة مهمة:** مجرد إضافة/تعديل متغيّر بإعدادات GitHub **لا يعيد تشغيل** الـ
workflow تلقائياً. لازم بعدها push جديد، أو Re-run على آخر تشغيل من تبويب
Actions، أو `workflow_dispatch`.

### ب) خطأ بناء `Cannot find module '@/features/.../XxxSection'` مع أن الملف موجود فعلياً على القرص

**العرض:** `npm run typecheck` أو `npm run build` يفشل بـ
`TS2307: Cannot find module`، لكن الملف موجود بوضوح بالمسار المذكور عند فتحه
محلياً.

**السبب:** `.gitignore` يحتوي سطر `coverage` بدون `/` بالبداية — وهذا النمط
بمعيار `.gitignore` يطابق **أي مجلد** بأي عمق اسمه `coverage`، وليس فقط مجلد
تقارير اختبار الجذر. أي مجلد مصدر حقيقي مثل `src/features/coverage/` يقع ضحية
هذا النمط ويُتجاهَل من git بصمت — يبقى موجوداً محلياً على القرص (لذلك يعمل
`npm run typecheck` محلياً) لكنه لا يُرفع أبداً لـ GitHub، فبيئة الـ CI (التي
تستنسخ من git فقط) لا تراه إطلاقاً.

**كيف تتأكد:**

```bash
git check-ignore -v path/to/the/missing/file.tsx   # لو طبع سطر .gitignore فهذا هو السبب
git ls-files | grep -i <اسم المجلد المشكوك فيه>      # لو ما طلع شي، الملف غير متتبَّع
```

**الحل:** غيّر السطر بـ `.gitignore` من `coverage` إلى `/coverage` (يقصر
المطابقة على مجلد الجذر فقط، وهو المقصود أصلاً لمخرجات تغطية الاختبارات)، ثم
`git add` للملفات التي كانت متجاهَلة خطأً و commit.

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
