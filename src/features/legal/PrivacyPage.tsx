import LegalPage from './LegalPage';
import LegalSections from './LegalSections';
import { PRIVACY_SECTIONS } from './legal.content';
import { paths } from '@/app/router/paths';

/**
 * Privacy Policy.
 *
 * Required by both app stores before the mobile app can be published, and it
 * actually describes what the platform collects — phone numbers, account and
 * store/vehicle profile fields, driver GPS location for dispatch, and the
 * customer contact/delivery data a merchant enters per order — grounded in
 * `delivery-backend/src/models/{user,order}.model.js`, not generic filler.
 * Content lives in `legal.content.ts` / i18n; this file only wires it up.
 */
export const PrivacyPage = () => (
  <LegalPage
    titleKey="footer.privacy"
    descriptionKey="seo.privacy.description"
    path={paths.legal.privacy}
    lastUpdated="2026-07-25"
  >
    <LegalSections sections={PRIVACY_SECTIONS} />
  </LegalPage>
);

export default PrivacyPage;
