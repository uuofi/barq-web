import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import { breadcrumbSchema, organizationSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';

/**
 * Contact page — structure only, no design.
 *
 * The form is intentionally not built here: its contract already exists
 * (`contact.schema.ts`) and its submission logic already exists
 * (`useContactForm.ts`). Building the UI is a matter of binding
 * `useForm({ resolver: zodResolver(contactFormSchema) })` to inputs and
 * resolving each `error.message` through `t()`.
 */
export const ContactPage = () => {
  const { t } = useTranslation();
  const title = t('nav.contact');

  return (
    <>
      <Seo
        title={title}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: t('nav.home'), path: paths.home },
            { name: title, path: paths.contact },
          ]),
        ]}
      />

      <Container as="section" data-page="contact">
        <h1>{title}</h1>
        {/* TODO(ui): contact form (contactFormSchema + useSubmitContact) */}
        {/* TODO(ui): contact channels — site.contact.* render conditionally */}
      </Container>
    </>
  );
};

export default ContactPage;
