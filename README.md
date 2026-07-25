# delivery-website — الموقع التعريفي لمنصة «برق»

موقع ويب عام (تسويقي/تعريفي) لمنصة البرق للتوصيل، مبني بـ **Vite + React 18 + TypeScript**.

> **حالة المشروع:** المعمارية كاملة ومُختبَرة وتُبنى بنجاح. **لا يوجد تصميم لأي صفحة** — كل صفحة هيكل دلالي (semantic skeleton) مع علامات `TODO(ui)` في أماكن المحتوى البصري.

---

## 1. مكان هذا المشروع من المنصة

```
Al-barq/
├── delivery-backend/   # Express + MongoDB + Socket.IO  (موجود)
├── delivery-app/       # React Native / Expo — تاجر + سائق (موجود)
├── delivery-admin/     # React + Vite — لوحة تحكم الأدمن (موجود)
└── delivery-website/   # ⭐ هذا المشروع — الموقع العام
```

كل واحد منها **قابل للنشر باستقلال** ويشترك فقط في الـ REST API. هذا الموقع:

- **لا يملك جلسة ولا توكن ولا socket** — عام بالكامل بلا مصادقة.
- **لا يستورد أي كود من المشاريع الأخرى** — ما يُشارَك (المحافظات، حالات الطلب) مُنسوخ صراحةً في `src/config/constants.ts` مع تعليق يوضّح أنه مرآة للباك اند.

---

## 2. التشغيل

```bash
npm install
cp .env.example .env      # ثم املأ القيم
npm run dev               # http://localhost:5174
```

المنفذ `5174` مقصود: `5173` محجوز للوحة الأدمن، فيعملان جنباً إلى جنب.
في التطوير يُمرَّر `/api` تلقائياً إلى الباك اند على `:4000` (proxy في `vite.config.ts`)، فلا حاجة لضبط CORS.

### الأوامر

| الأمر | الوظيفة |
|------|---------|
| `npm run dev` | خادم التطوير |
| `npm run build` | توليد sitemap → فحص الأنواع → بناء الإنتاج |
| `npm run preview` | معاينة مخرجات البناء |
| `npm run typecheck` | فحص الأنواع فقط |
| `npm run test` | اختبارات المعمارية (Vitest) |
| `npm run sitemap` | توليد `public/sitemap.xml` من سجل المسارات |

---

## 3. المتغيرات البيئية

كلها في `.env.example` وتُفحَص وقت الإقلاع في `src/config/env.ts`.

**قاعدة صارمة:** لا يقرأ أي ملف آخر `import.meta.env` — الكل يستورد `env`. أي قيمة مطلوبة ناقصة ترمي خطأً فوراً بدل نشر موقع مكسور بصمت (مثلاً `VITE_SITE_URL` إلزامي في الإنتاج لأنه أساس روابط canonical و Open Graph).

كل ما في هذا الملف **يصل إلى المتصفح** — لا تضع فيه أي سر.

---

## 4. النشر

المخرجات ملفات ثابتة في `dist/`. مطلوب **SPA fallback** (كل مسار غير معروف يُخدَم بـ `index.html`):

- Netlify / Cloudflare Pages → `public/_redirects` موجود وجاهز.
- Vercel → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Nginx → `try_files $uri $uri/ /index.html;`

**قبل أول نشر إنتاجي:**
1. اضبط `VITE_SITE_URL` (بدونه يفشل البناء عمداً).
2. حدّث رابط `Sitemap:` في `public/robots.txt` إن تغيّر النطاق.
3. أضف الصور الناقصة: `public/favicon.svg`، `public/logo.png`، `public/og/default.png` (1200×630)، وأيقونات `public/icons/`.

---

## 5. أين أضيف شيئاً جديداً؟

| أريد أن... | الملف |
|-----------|-------|
| أضيف صفحة | `src/features/<اسم>/` ثم سجّلها في `src/app/router/routes.tsx` و`paths.ts` |
| أغيّر رابطاً | `src/app/router/paths.ts` فقط |
| أضيف نداء API | `src/lib/http/endpoints.ts` ثم `<feature>.api.ts` |
| أضيف نصاً | `src/i18n/locales/ar.json` + `en.json` |
| أغيّر لوناً/مسافة | `src/styles/tokens.css` |
| أضيف حدثاً تحليلياً | `AnalyticsEvent` في `src/lib/analytics.ts` |

التفاصيل المعمارية الكاملة في **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## 6. ⚠️ فجوة معروفة في الباك اند

الباك اند الحالي **لا يوفّر أي مسار عام (public)** — كل شيء تحت `/auth`، `/merchant`، `/driver`، `/admin` ويتطلب توكناً ودوراً.

لذلك ميزتان في هذا الموقع جاهزتان بالكامل من ناحية الواجهة لكنهما **معطّلتان خلف feature flags**:

| الميزة | المسار المطلوب | العَلَم |
|-------|----------------|--------|
| تتبع الطلب | `GET /public/orders/track?code=` | `VITE_FEATURE_ORDER_TRACKING` |
| نماذج التواصل/الاهتمام | `POST /public/leads`, `POST /public/contact` | `VITE_FEATURE_LEAD_FORMS` |

كل مسار مُوثَّق مع متطلباته الأمنية في `src/lib/http/endpoints.ts`. أهمها:

> **تتبع الطلب يجب أن يُعيد بيانات غير حساسة فقط** (الرمز، الحالة، التواريخ، المحافظة) — أبداً هاتف الزبون أو عنوانه أو هوية السائق. أي شخص يخمّن رمز طلب سيصل لهذه البيانات. الـ schema في `src/features/tracking/tracking.schema.ts` يُسقط أي حقل زائد كطبقة دفاع ثانية، لكن الدفاع الأول مسؤولية الباك اند.

المسارات العامة تحتاج أيضاً **rate limiter خاصاً بها** — الموجود حالياً (`authLimiter`) يغطي `/auth` فقط.
# barq-web
