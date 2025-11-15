import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const resources = {
  en: { translation: { "login":"Login","email":"Email","password":"Password","dashboard":"Dashboard","sales":"Sales","stock":"Stock","expenses":"Expenses","welcome":"Welcome, {{name}}","tzs":"TZS" } },
  sw: { translation: { "login":"Ingia","email":"Barua pepe","password":"Nenosiri","dashboard":"Dashibodi","sales":"Mauzo","stock":"Hisa","expenses":"Gharama","welcome":"Karibu, {{name}}","tzs":"TZS" } }
};
i18n.use(initReactI18next).init({ resources, lng: localStorage.getItem('lang')||'en', fallbackLng: 'en', interpolation:{ escapeValue:false } });
export default i18n;