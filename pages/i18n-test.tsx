// pages/i18n-test.tsx
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function I18nTest() {
  const { t } = useTranslation('home');
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>i18n test</h1>
      <p><b>t("hero.title"):</b> {t('hero.title')}</p>
      <p><b>t("nav.news"):</b> {t('nav.news')}</p>
      <p>Si ves textos (no keys), i18n funciona ✅</p>
    </main>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'es', ['home'])),
    },
  };
}
