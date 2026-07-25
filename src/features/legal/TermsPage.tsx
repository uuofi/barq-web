import LegalPage from './LegalPage';
import LegalSections from './LegalSections';
import { TERMS_SECTIONS } from './legal.content';
import { paths } from '@/app/router/paths';

/**
 * Terms & Conditions.
 *
 * The mobile app's merchant registration screen already links to «الشروط
 * والأحكام»; this is the canonical destination for that link. Content is
 * grounded in the actual account/order/attendance model (governorate-scoped
 * accounts, admin-gated driver attendance, cash-on-delivery, driver rating —
 * see `delivery-backend/src/models/`), not boilerplate. Content lives in
 * `legal.content.ts` / i18n; this file only wires it up.
 */
export const TermsPage = () => (
  <LegalPage
    titleKey="footer.terms"
    descriptionKey="seo.terms.description"
    path={paths.legal.terms}
    lastUpdated="2026-07-25"
  >
    <LegalSections sections={TERMS_SECTIONS} />
  </LegalPage>
);

export default TermsPage;
