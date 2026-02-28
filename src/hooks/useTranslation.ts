import { translations, Language } from '../lib/translations';

export const useTranslation = (language: Language) => {
  const t = (key: keyof typeof translations['en'], params?: Record<string, string>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };
  return { t };
};
