# دليل نشر موقع Al-Barq (delivery-website) — للتنفيذ المستقل بواسطة أي AI

ملف واحد مستقل بذاته: أي AI/وكيل يقرأه فقط (بدون أي سياق سابق عن المشروع) يقدر
ينفّذ نشر هذا الموقع من الصفر، أو يشخّص ويصلح مشكلة نشر قائمة، بالاعتماد على
هذا الملف حصراً.

## 0) ما هو هذا المشروع

- `delivery-website`: موقع React + Vite + TypeScript، **موقع تعريفي ثابت
  بالكامل** (لا خادم Node يعمل باستمرار، لا Docker، لا قاعدة بيانات).
- الناتج النهائي بعد البناء هو مجلد `dist/` — ملفات HTML/CSS/JS ثابتة تُخدَّم
  مباشرة عبر nginx.
- الدومين الإنتاجي: `https://barq-iq.site`.
- الاستضافة: **نفس VPS** الذي يشغّل الباك-إند `delivery-backend`، لكن كموقع
  **Static** منفصل تماماً في **CloudPanel** (لوحة تحكم السيرفر).
- الـ CI/CD: **GitHub Actions** — كل `push` على فرع `main` يبني الموقع
  وينسخ `dist/` تلقائياً للسيرفر عبر `rsync` فوق SSH. لا يوجد نشر يدوي عادةً.
- مستودع Git لهذا الموقع **منفصل** عن باقي مشاريع Al-barq (له `origin` خاص به،
  مثال: `git@github.com:uuofi/barq-web.git`).

## 1) المتطلبات قبل أي نشر

للتنفيذ الكامل من الصفر تحتاج وصول إلى:

1. **مستودع GitHub** الخاص بالموقع (صلاحية push + صلاحية تعديل
   `Settings → Secrets and variables → Actions`).
2. **SSH access** على الـ VPS (نفس سيرفر الباك-إند)، بصلاحية كافية لإنشاء موقع
   جديد في CloudPanel.
3. **لوحة CloudPanel** على نفس السيرفر (واجهة ويب لإدارة المواقع/الشهادات).
4. الدومين `barq-iq.site` يشير DNS-يّاً إلى IP السيرفر (A record).

إن كان الهدف تشخيص/إصلاح نشر **قائم بالفعل** (وليس إعداد من الصفر)، يكفي عادةً
وصول لمستودع GitHub فقط — راجع القسم 6 مباشرة.

## 2) التحقق محلياً قبل أي دفع (push)

```bash
cd delivery-website
npm install
npm run typecheck      # tsc --noEmit -p tsconfig.json — يجب أن يمر بدون أخطاء
npm test               # vitest run
npm run build           # يشغّل: sitemap script → tsc -b → vite build → ينتج dist/
npm run preview         # يعاين dist/ محلياً على منفذ محلي
```

إذا فشل `npm run build` بخطأ مثل `Cannot find module '@/features/.../X'` مع أن
الملف موجود فعلياً على القرص — هذا عرض معروف، راجع البند (ب) بالقسم 8 فوراً
قبل أي تحقيق إضافي.

## 3) رفع/تحديث المستودع على GitHub

إن لم يكن المجلد مستودع git بعد:

```bash
git init -b main
git add .
git commit -m "chore: initial website commit"
git remote add origin git@github.com:<USERNAME>/<REPO>.git
git push -u origin main
```

ملف `.env` الحقيقي لا يُرفع أبداً (محمي بـ `.gitignore`) — فقط `.env.example`.
كل القيم الفعلية تُضبط لاحقاً كـ **GitHub Actions Variables** (القسم 5)، لا
حاجة لملف `.env` على السيرفر إطلاقاً لأن هذا موقع ثابت يُبنى في CI ولا يُشغَّل
بعملية Node على السيرفر.

## 4) تجهيز CloudPanel (مرة واحدة فقط، عند أول نشر)

على لوحة CloudPanel لنفس سيرفر الباك-إند:

1. أنشئ موقعاً جديداً من نوع **Static** ووجّه إليه الدومين `barq-iq.site`
   (و`www.barq-iq.site` إن رغبت).
2. لاحظ **Document Root** (عادة `/home/<user>/htdocs/barq-iq.site/`) — هذا
   المسار سيُستخدم كسر GitHub باسم `WEBSITE_DEPLOY_PATH` بالقسم التالي.
3. فعّل شهادة **Let's Encrypt** من CloudPanel (تجديد تلقائي).
4. **إلزامي — SPA fallback**: من إعدادات الموقع → Nginx (Vhost)، أضف داخل
   `location /`:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```
   بدون هذا، أي تحديث يدوي (F5) على مسار غير الجذر مثل `/download` أو
   `/legal/terms` يطلع 404 حقيقي من nginx بدل ما يُسلَّم لتطبيق React.
5. (اختياري، أداء) Cache-Control طويل الأمد لمجلد الأصول (كل ملف بناء يحمل
   بصمة/hash في اسمه فهو غير قابل للتغيير):
   ```nginx
   location /assets/ {
     add_header Cache-Control "public, max-age=31536000, immutable";
   }
   ```
6. تأكد أن مستخدم SSH المستخدَم بالخطوة التالية يملك صلاحية الكتابة على هذا
   الـ Document Root (يُفضَّل مستخدم CloudPanel مخصّص لهذا الموقع فقط).

## 5) إعداد GitHub Actions — Secrets و Variables

**هذه أهم نقطة بالملف كامل — الفرق بين Secrets و Variables هو مصدر أكثر
الأعطال شيوعاً (راجع القسم 8-أ).** الاثنان تبويبان منفصلان تماماً تحت
`Settings → Secrets and variables → Actions` في مستودع الموقع، ولا يشوف
أحدهما الثاني إطلاقاً داخل الـ workflow.

### 5.1) تبويب **Secrets** — بيانات اتصال حساسة (`secrets.*` في الـ workflow)

| السر | الوصف |
|---|---|
| `VPS_HOST` | IP أو دومين السيرفر |
| `VPS_USER` | مستخدم SSH |
| `VPS_SSH_KEY` | المفتاح الخاص (private key) كاملاً لهذا المستخدم |
| `VPS_PORT` | منفذ SSH (اختياري، افتراضي 22) |
| `WEBSITE_DEPLOY_PATH` | Document Root من القسم 4.2 |

توليد مفتاح SSH مخصّص للنشر:

```bash
ssh-keygen -t ed25519 -f website_deploy_key -N ""
# أضف محتوى website_deploy_key.pub إلى ~/.ssh/authorized_keys لمستخدم السيرفر
# ضع محتوى website_deploy_key (الخاص) كاملاً في السر VPS_SSH_KEY
```

### 5.2) تبويب **Variables** — قيم تُضمَّن في حزمة JS المرسَلة للمتصفح (`vars.*`)

كل قيمة هنا **ليست سرية** فعلياً — تُطبع حرفياً داخل ملفات `dist/assets/*.js`
عند `vite build` (انظر `src/config/env.ts`)، فوضعها بالخطأ في Secrets لا يزيد
أي حماية ويسبب فشلاً صامتاً (القسم 8-أ).

| المتغيّر | مطلوب؟ | ملاحظة |
|---|---|---|
| `VITE_SITE_URL` | **نعم، إلزامي** | `https://barq-iq.site` — الروابط القانونية (canonical) وصور المشاركة تُبنى منه |
| `VITE_API_BASE_URL` | **نعم، إلزامي** | `https://api.barq-iq.site/api/v1` — راجع التحذير تحت الجدول |

> **`VITE_API_BASE_URL` كان موثّقاً هنا سابقاً كاختياري، وهذا تسبّب بعطل حقيقي.**
> كان المكتوب أن «فارغ = الموقع يستدعي `/api/v1` على نفس الدومين»، وهذا صحيح
> فقط لو كان nginx على `barq-iq.site` يمرّر `/api/v1` إلى الباك اند — وهو **لا
> يفعل**: يردّ `405 Not Allowed` لأنه خادم ملفات ثابتة. النتيجة كانت موقعاً يبدو
> سليماً تماماً (الصفحات تُعرض، التنقّل يعمل) بينما **كل نموذج فيه معطّل**: رفع
> صورة السائق يفشل، ولا يصل أي طلب تسجيل إلى لوحة الإدارة.
>
> المتغيّران أعلاه صار يفرضهما `scripts/check-env.mjs` قبل `vite build`، فالبناء
> الآن **يفشل بوضوح** بدل أن ينشر نسخة نصف عاملة.
>
> البديل الوحيد لترك المتغيّر فارغاً هو إعداد nginx على دومين الموقع ليمرّر
> `/api/v1` فعلاً إلى الباك اند (يلغي الحاجة إلى CORS)، وعندها فقط يصحّ الكلام
> القديم.
| `VITE_APP_STORE_URL` / `VITE_PLAY_STORE_URL` / `VITE_APK_DOWNLOAD_URL` | لا | فارغ = زر التحميل يظهر معطّلاً |
| `VITE_CONTACT_PHONE` / `VITE_CONTACT_EMAIL` / `VITE_WHATSAPP_NUMBER` | لا | فارغ = يختفي ذلك السطر من التذييل |
| `VITE_ANALYTICS_ID` | لا | فارغ = التحليلات معطّلة (no-op) |
| `VITE_FEATURE_ORDER_TRACKING` / `VITE_FEATURE_LEAD_FORMS` | لا | القيم `'true'` أو `'false'` فقط |

**تحقق دائماً بعد الإضافة أنك بتبويب Variables وليس Secrets — الاسمان
متشابهان جداً بصرياً بواجهة GitHub.**

## 6) تشغيل/تشخيص دورة النشر

### تشغيل نشر جديد

مجرد إضافة/تعديل Secret أو Variable **لا يعيد تشغيل الـ workflow تلقائياً**.
لتفعيل نشر بعد أي تعديل بالإعدادات، لازم واحد من:

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

أو من تبويب **Actions** بمستودع GitHub: افتح آخر تشغيل واضغط **Re-run all
jobs**، أو استخدم **Run workflow** (workflow_dispatch) إن كان الملف يدعمه.

### التحقق من نجاح آخر تشغيل (بدون gh CLI، بدون توكن — يعمل على أي مستودع عام)

```bash
curl -s "https://api.github.com/repos/<OWNER>/<REPO>/actions/runs?per_page=3" \
  -H "User-Agent: check" | grep -E '"id":|"conclusion"|"created_at"|"head_sha"'
```

يجب أن يكون آخر تشغيل `"conclusion":"success"` وتاريخه أحدث من آخر push.

### التحقق أن الموقع الحي فعلاً يعكس آخر بناء

```bash
curl -sI "https://barq-iq.site/" | grep -i last-modified
curl -s "https://barq-iq.site/" | grep -o 'index-[A-Za-z0-9_-]*\.js'
```

قارن اسم الملف (يحتوي hash) مع آخر تشغيل ناجح — إذا نفس الاسم القديم بعد push
جديد، الفحص لم يلتقط تغييراً فعلياً (تحقق من رابط النشر/الأصول بالخطوة
التالية).

### التحقق أن متغيّرات البيئة (Variables) فعلاً وصلت لحزمة JS النهائية

```bash
JS=$(curl -s "https://barq-iq.site/" | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://barq-iq.site/assets/$JS" | grep -c "barq-iq.site"
```

- `0` → `VITE_SITE_URL` لم يصل للبناء (شبه مؤكد أنه بـ Secrets بدل Variables،
  أو غير موجود إطلاقاً) → راجع القسم 8-أ.
- `>0` → المتغيّر وصل والبناء صحيح.

## 7) التراجع (Rollback)

لا يوجد سجل صور Docker هنا — التراجع يعني إعادة بناء ونشر commit سابق:

```bash
git push origin <old-commit-sha>:main --force-with-lease
```

أو أعد التشغيل (Re-run) من تبويب Actions على تشغيل سابق ناجح لذلك الـ commit.

للطوارئ الأسرع: عبر SSH على السيرفر، استرجع نسخة `dist/` سابقة محفوظة يدوياً
إن كانت متوفرة — هذا الإعداد لا يحتفظ بأرشيف تلقائي للإصدارات افتراضياً.

## 8) أخطاء شائعة موثّقة (بأعراضها الحقيقية)

### أ) الموقع يطلع صفحة سوداء/فاضية تماماً — لا هيدر، لا نص، لا أي عنصر

**العرض:** فتح `barq-iq.site` يطلع خلفية داكنة فاضية بلا أي محتوى. الـ
workflow نجح (أخضر بالكامل) والملفات موجودة فعلياً على السيرفر (`curl` على
الجذر يرجع 200).

**السبب الجذري:** `src/config/env.ts` يرمي (`throw new Error(...)`) عمداً
إذا كانت `VITE_SITE_URL` فاضية وقت الإنتاج — هذا الاستثناء يصير أثناء تحميل
`main.tsx`، **قبل** ما React يعمل mount لأي عنصر، فتطلع الصفحة فاضية تماماً
بلا أي رسالة مرئية بالصفحة نفسها (الخطأ موجود فقط بـ console المتصفح).

**السبب الأكثر شيوعاً لماذا `VITE_SITE_URL` فاضية رغم إضافتها:** انضافت
بتبويب **Secrets** بدل تبويب **Variables**. الـ workflow (`.github/workflows/website.yml`)
يقرأ حصراً `${{ vars.VITE_SITE_URL }}` — فإذا انضاف السر بـ `secrets.*` يبقى
`vars.VITE_SITE_URL` فاضياً من منظور الخطوة، والبناء **ينجح بصمت** (`vite
build` لا يفشل، فقط يُضمِّن قيمة فارغة) بينما وقت تشغيل الصفحة بالمتصفح يرمي
الاستثناء.

**التحقق السريع:** أمر القسم 6 الأخير (`grep -c "barq-iq.site"` على الحزمة
المنشورة) — `0` يؤكد المشكلة فوراً بدون الحاجة لصلاحية دخول إعدادات GitHub.

**الحل:** أضف `VITE_SITE_URL=https://barq-iq.site` من تبويب **Variables**
بالتحديد (وليس Secrets). احذف النسخة من Secrets إن وُجدت (القيمة غير حساسة
أصلاً، فبقاؤها هناك لا يضر أمنياً لكنه يسبب اللبس). ثم شغّل نشراً جديداً
(القسم 6) — إضافة المتغيّر وحدها لا تكفي.

### ب) خطأ بناء `Cannot find module '@/features/.../XxxSection'` رغم أن الملف موجود فعلياً على القرص

**العرض:** `npm run typecheck` أو `npm run build` يفشل بـ
`TS2307: Cannot find module` لملف يظهر بوضوح عند فتحه يدوياً بالمسار المذكور.
يعمل غالباً **محلياً بدون مشكلة** لكن يفشل في CI (GitHub Actions).

**السبب الجذري:** `.gitignore` يحتوي سطراً مثل `coverage` بدون `/` في البداية.
بمعيار `.gitignore`، هذا النمط يطابق **أي مجلد بأي عمق** اسمه `coverage`، وليس
فقط مجلد تقارير تغطية الاختبارات بالجذر. أي مجلد مصدر حقيقي باسم مطابق مثل
`src/features/coverage/` يقع ضحية هذا النمط ويُتجاهَل من git بصمت — يبقى على
القرص محلياً (لذلك البناء المحلي ينجح) لكنه لا يُرفع أبداً لـ GitHub، فـ CI
(الذي يستنسخ من git فقط) لا يراه إطلاقاً.

**التحقق السريع:**

```bash
git check-ignore -v path/to/the/missing/file.tsx   # لو طبع سطر .gitignore، هذا هو السبب
git ls-files | grep -i <اسم المجلد المشكوك فيه>
```

**الحل:** غيّر السطر بـ `.gitignore` من `coverage` إلى `/coverage` (يحصر
المطابقة على مجلد الجذر فقط، وهو المقصود أصلاً)، ثم `git add` للملفات التي
كانت متجاهَلة خطأً و commit.

## 9) ملاحظات عامة

- موقع ثابت بالكامل: لا Docker، لا قاعدة بيانات، لا عملية Node تعمل باستمرار
  على السيرفر — عزل تام عن الباك-إند باستثناء مشاركة الخادم الفعلي والدومين.
- إن استدعى الموقع الـ API مباشرة من متصفح الزائر (`VITE_API_BASE_URL`)، تأكّد
  أن `CORS_ORIGIN` في أسرار الباك-إند يشمل دومين هذا الموقع.
- ملفات `dist/` مبنية بأسماء تتضمّن hash المحتوى — نشر خاطئ لا "يكسر" نسخة
  قديمة يستخدمها متصفح مفتوح حالياً؛ أسوأ حالة هي 404 مؤقت لملف لم يعد موجوداً
  حتى يُعاد تحميل الصفحة.
- سكربت `npm run lint` معرَّف بـ `package.json` لكن ESLint غير مثبَّت/مهيَّأ
  فعلياً بعد — لذلك غير مُشغَّل ضمن الـ workflow عمداً.
