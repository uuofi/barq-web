import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import Container from '@/components/layout/Container';
import { breadcrumbSchema, mobileAppSchema } from '@/lib/seo/schema';
import { paths } from '@/app/router/paths';
import { env } from '@/config/env';
import { analytics } from '@/lib/analytics';

/**
 * App download page — structure only, no design.
 *
 * Every store link is conditional on env: a button pointing at an empty href
 * is worse than no button. The JSON-LD blocks follow the same rule, so the
 * page never claims an iOS app exists before it is published.
 */
export const DownloadPage = () => {
  const { t } = useTranslation();
  const title = t('nav.download');
  const { appStore, playStore, apkDownload } = env.links;

  const jsonLd = [
    breadcrumbSchema([
      { name: t('nav.home'), path: paths.home },
      { name: title, path: paths.download },
    ]),
    ...(playStore ? [mobileAppSchema({ operatingSystem: 'ANDROID', downloadUrl: playStore })] : []),
    ...(appStore ? [mobileAppSchema({ operatingSystem: 'iOS', downloadUrl: appStore })] : []),
  ];

  return (
    <>
      <Seo title={title} jsonLd={jsonLd} />

      <Container as="section" data-page="download">
        <h1>{title}</h1>

        <div data-component="store-links">
          {playStore && (
            <a
              href={playStore}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.track({ name: 'app_download_click', platform: 'android' })}
            >
              Google Play
            </a>
          )}
          {appStore && (
            <a
              href={appStore}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.track({ name: 'app_download_click', platform: 'ios' })}
            >
              App Store
            </a>
          )}
          {apkDownload && (
            <a
              href={apkDownload}
              rel="noopener noreferrer"
              onClick={() => analytics.track({ name: 'app_download_click', platform: 'apk' })}
            >
              APK
            </a>
          )}
        </div>
      </Container>
    </>
  );
};

export default DownloadPage;
