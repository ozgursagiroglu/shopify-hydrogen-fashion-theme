import type {ResourceLanguage} from 'i18next';
import translation from './translation';

export default {translation} satisfies ResourceLanguage;

export type LanguageTranslations = typeof translation;