import type { Language } from '@/i18n';

/**
 * FAQ content as DATA, not markup.
 *
 * Keeping the entries here — rather than as JSX inside the FAQ section — is
 * what lets the same source feed both the rendered accordion and the
 * `faqSchema()` JSON-LD that produces an expandable FAQ block in Google
 * results. Two hand-maintained copies of the same questions would drift
 * within a month.
 *
 * When these grow past ~20 entries, or need editing by a non-developer, this
 * module is the seam to replace with a CMS/JSON fetch: the page consumes
 * `getFaqEntries(language)` and nothing else needs to change.
 */

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  /** Optional grouping for a sectioned FAQ page. */
  category?: 'general' | 'merchants' | 'drivers' | 'orders';
}

const AR: FaqEntry[] = [
  {
    id: 'how-to-order',
    category: 'orders',
    question: 'كيف أطلب توصيل عبر البرق؟',
    answer:
      'يقدّم التاجر طلب توصيل من خلال تطبيق أو لوحة التاجر، فيصل الطلب مباشرة لأقرب سائق متاح، ويتولى السائق الاستلام والتسليم مع تتبع مباشر لحالة الطلب.',
  },
  {
    id: 'coverage-areas',
    category: 'general',
    question: 'ما هي المناطق التي يغطيها البرق حالياً؟',
    answer:
      'نعمل حالياً في محافظتي الديوانية والنجف، ونعمل على التوسع تدريجياً لتغطية محافظات عراقية إضافية.',
  },
  {
    id: 'become-driver',
    category: 'drivers',
    question: 'كيف أنضم كسائق في البرق؟',
    answer:
      'اضغط على "سجّل كسائق"، عبّئ بياناتك الأساسية ووثائقك المطلوبة، وبعد المراجعة يتم تفعيل حسابك وتبدأ باستلام الطلبات القريبة منك.',
  },
  {
    id: 'become-merchant',
    category: 'merchants',
    question: 'كيف أسجّل متجري على المنصة؟',
    answer:
      'قدّم طلب انضمام كتاجر من خلال الموقع أو التطبيق، وبعد تأكيد بيانات متجرك تحصل على لوحة تحكم لإنشاء طلبات التوصيل ومتابعتها ومتابعة أرباحك.',
  },
  {
    id: 'delivery-time',
    category: 'orders',
    question: 'كم يستغرق تسليم الطلب عادة؟',
    answer:
      'يعتمد وقت التسليم على المسافة وازدحام الطلبات، لكن غالبية الطلبات داخل المدينة تصل خلال وقت قصير بفضل توزيع السائقين على المناطق.',
  },
  {
    id: 'track-order',
    category: 'orders',
    question: 'كيف أتابع حالة طلبي؟',
    answer:
      'يمكنك تتبع طلبك لحظة بلحظة من خلال صفحة "تتبع الطلب" باستخدام رمز الطلب الذي تستلمه فور تأكيد الطلب.',
  },
  {
    id: 'earnings-payout',
    category: 'drivers',
    question: 'كيف يستلم السائق أرباحه؟',
    answer:
      'تُحتسب أرباح كل طلب فور تسليمه وتظهر في حساب السائق داخل التطبيق، مع دورات تحصيل منتظمة حسب سياسة الدفع المعتمدة.',
  },
];

const EN: FaqEntry[] = [
  {
    id: 'how-to-order',
    category: 'orders',
    question: 'How do I request a delivery through Al-Barq?',
    answer:
      'A merchant creates a delivery request from the merchant app or dashboard. The order goes straight to the nearest available driver, who handles pickup and delivery with live status tracking.',
  },
  {
    id: 'coverage-areas',
    category: 'general',
    question: 'Which areas does Al-Barq currently cover?',
    answer:
      'We currently operate in the Diwaniyah and Najaf governorates, and we are gradually expanding to more governorates across Iraq.',
  },
  {
    id: 'become-driver',
    category: 'drivers',
    question: 'How do I join as a driver?',
    answer:
      'Tap "Sign up as a driver", fill in your basic details and required documents. Once reviewed, your account is activated and you start receiving nearby orders.',
  },
  {
    id: 'become-merchant',
    category: 'merchants',
    question: 'How do I register my store on the platform?',
    answer:
      'Submit a merchant application through the website or app. Once your store details are confirmed, you get a dashboard to create delivery orders, track them, and follow your earnings.',
  },
  {
    id: 'delivery-time',
    category: 'orders',
    question: 'How long does delivery usually take?',
    answer:
      'Delivery time depends on distance and current order volume, but most in-city orders arrive quickly thanks to drivers distributed across coverage areas.',
  },
  {
    id: 'track-order',
    category: 'orders',
    question: 'How do I track my order?',
    answer:
      'You can track your order in real time from the "Track order" page using the order code you receive as soon as the order is confirmed.',
  },
  {
    id: 'earnings-payout',
    category: 'drivers',
    question: 'How do drivers receive their earnings?',
    answer:
      'Earnings for each order are calculated the moment it is delivered and appear in the driver account in the app, with regular payout cycles per the approved payment policy.',
  },
];

export const getFaqEntries = (language: Language): FaqEntry[] =>
  language === 'en' ? EN : AR;
