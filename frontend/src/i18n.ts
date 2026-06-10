import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import es from '@/locales/es';

const locale = getLocales()[0]?.languageCode ?? 'es';

i18n.use(initReactI18next).init({
  resources: { es },
  lng: locale,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;