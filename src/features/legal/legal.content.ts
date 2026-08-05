/**
 * Legal document content as DATA — same rationale as `features/about/about.content.ts`.
 *
 * Terms and Privacy are both a flat list of sections (heading + paragraphs
 * and/or a bullet list); only the i18n keys differ per document. Declaring
 * the shape here means `TermsPage`/`PrivacyPage` never touch a raw i18n key
 * string — they just map over their section list.
 */

export interface LegalSection {
  id: string;
  titleKey: string;
  /** Plain paragraphs, rendered in order before any list. */
  paragraphKeys?: string[];
  /** Rendered as a <ul> when present. */
  listKeys?: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'intro',
    titleKey: 'legal.privacy.sections.intro.title',
    paragraphKeys: ['legal.privacy.sections.intro.p1'],
  },
  {
    id: 'accountData',
    titleKey: 'legal.privacy.sections.accountData.title',
    paragraphKeys: ['legal.privacy.sections.accountData.intro'],
    listKeys: [
      'legal.privacy.sections.accountData.item1',
      'legal.privacy.sections.accountData.item2',
      'legal.privacy.sections.accountData.item3',
      'legal.privacy.sections.accountData.item4',
    ],
  },
  {
    id: 'profileData',
    titleKey: 'legal.privacy.sections.profileData.title',
    listKeys: [
      'legal.privacy.sections.profileData.item1',
      'legal.privacy.sections.profileData.item2',
      'legal.privacy.sections.profileData.item3',
    ],
  },
  {
    id: 'orderData',
    titleKey: 'legal.privacy.sections.orderData.title',
    paragraphKeys: [
      'legal.privacy.sections.orderData.p1',
      'legal.privacy.sections.orderData.p2',
      'legal.privacy.sections.orderData.p3',
    ],
  },
  {
    id: 'pushTokens',
    titleKey: 'legal.privacy.sections.pushTokens.title',
    paragraphKeys: ['legal.privacy.sections.pushTokens.p1'],
  },
  {
    id: 'cookies',
    titleKey: 'legal.privacy.sections.cookies.title',
    paragraphKeys: ['legal.privacy.sections.cookies.p1'],
  },
  {
    id: 'howWeUse',
    titleKey: 'legal.privacy.sections.howWeUse.title',
    listKeys: [
      'legal.privacy.sections.howWeUse.item1',
      'legal.privacy.sections.howWeUse.item2',
      'legal.privacy.sections.howWeUse.item3',
      'legal.privacy.sections.howWeUse.item4',
      'legal.privacy.sections.howWeUse.item5',
      'legal.privacy.sections.howWeUse.item6',
      'legal.privacy.sections.howWeUse.item7',
      'legal.privacy.sections.howWeUse.item8',
    ],
  },
  {
    id: 'sharing',
    titleKey: 'legal.privacy.sections.sharing.title',
    paragraphKeys: [
      'legal.privacy.sections.sharing.p1',
      'legal.privacy.sections.sharing.p2',
      'legal.privacy.sections.sharing.p3',
      'legal.privacy.sections.sharing.p4',
    ],
  },
  {
    id: 'security',
    titleKey: 'legal.privacy.sections.security.title',
    paragraphKeys: ['legal.privacy.sections.security.p1'],
  },
  {
    id: 'retention',
    titleKey: 'legal.privacy.sections.retention.title',
    paragraphKeys: ['legal.privacy.sections.retention.p1'],
  },
  {
    // Sits directly after retention on purpose: one states how long data is
    // kept, the next states how a user ends that themselves. The page it
    // describes is `paths.account.delete`.
    id: 'deletion',
    titleKey: 'legal.privacy.sections.deletion.title',
    paragraphKeys: [
      'legal.privacy.sections.deletion.p1',
      'legal.privacy.sections.deletion.p2',
    ],
  },
  {
    id: 'rights',
    titleKey: 'legal.privacy.sections.rights.title',
    listKeys: [
      'legal.privacy.sections.rights.item1',
      'legal.privacy.sections.rights.item2',
      'legal.privacy.sections.rights.item3',
      'legal.privacy.sections.rights.item4',
    ],
  },
  {
    id: 'minors',
    titleKey: 'legal.privacy.sections.minors.title',
    paragraphKeys: ['legal.privacy.sections.minors.p1'],
  },
  {
    id: 'changes',
    titleKey: 'legal.privacy.sections.changes.title',
    paragraphKeys: ['legal.privacy.sections.changes.p1'],
  },
  {
    id: 'contact',
    titleKey: 'legal.privacy.sections.contact.title',
    paragraphKeys: ['legal.privacy.sections.contact.p1'],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    titleKey: 'legal.terms.sections.acceptance.title',
    paragraphKeys: ['legal.terms.sections.acceptance.p1'],
  },
  {
    id: 'serviceDefinition',
    titleKey: 'legal.terms.sections.serviceDefinition.title',
    paragraphKeys: ['legal.terms.sections.serviceDefinition.p1'],
  },
  {
    id: 'coverageArea',
    titleKey: 'legal.terms.sections.coverageArea.title',
    paragraphKeys: ['legal.terms.sections.coverageArea.p1'],
  },
  {
    id: 'eligibility',
    titleKey: 'legal.terms.sections.eligibility.title',
    listKeys: [
      'legal.terms.sections.eligibility.item1',
      'legal.terms.sections.eligibility.item2',
      'legal.terms.sections.eligibility.item3',
    ],
  },
  {
    id: 'merchantObligations',
    titleKey: 'legal.terms.sections.merchantObligations.title',
    listKeys: [
      'legal.terms.sections.merchantObligations.item1',
      'legal.terms.sections.merchantObligations.item2',
      'legal.terms.sections.merchantObligations.item3',
      'legal.terms.sections.merchantObligations.item4',
    ],
  },
  {
    id: 'driverObligations',
    titleKey: 'legal.terms.sections.driverObligations.title',
    listKeys: [
      'legal.terms.sections.driverObligations.item1',
      'legal.terms.sections.driverObligations.item2',
      'legal.terms.sections.driverObligations.item3',
      'legal.terms.sections.driverObligations.item4',
      'legal.terms.sections.driverObligations.item5',
    ],
  },
  {
    id: 'feesAndPayment',
    titleKey: 'legal.terms.sections.feesAndPayment.title',
    paragraphKeys: [
      'legal.terms.sections.feesAndPayment.p1',
      'legal.terms.sections.feesAndPayment.p2',
      'legal.terms.sections.feesAndPayment.p3',
    ],
  },
  {
    id: 'cancellation',
    titleKey: 'legal.terms.sections.cancellation.title',
    paragraphKeys: ['legal.terms.sections.cancellation.p1'],
  },
  {
    id: 'ratingsAndBlocking',
    titleKey: 'legal.terms.sections.ratingsAndBlocking.title',
    paragraphKeys: [
      'legal.terms.sections.ratingsAndBlocking.p1',
      'legal.terms.sections.ratingsAndBlocking.p2',
      'legal.terms.sections.ratingsAndBlocking.p3',
    ],
  },
  {
    id: 'intellectualProperty',
    titleKey: 'legal.terms.sections.intellectualProperty.title',
    paragraphKeys: ['legal.terms.sections.intellectualProperty.p1'],
  },
  {
    id: 'liability',
    titleKey: 'legal.terms.sections.liability.title',
    paragraphKeys: ['legal.terms.sections.liability.p1'],
  },
  {
    id: 'governingLaw',
    titleKey: 'legal.terms.sections.governingLaw.title',
    paragraphKeys: ['legal.terms.sections.governingLaw.p1'],
  },
  {
    id: 'changes',
    titleKey: 'legal.terms.sections.changes.title',
    paragraphKeys: ['legal.terms.sections.changes.p1'],
  },
  {
    id: 'contact',
    titleKey: 'legal.terms.sections.contact.title',
    paragraphKeys: ['legal.terms.sections.contact.p1'],
  },
];
