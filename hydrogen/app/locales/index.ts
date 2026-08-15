/**
 * Locales re-export for remix-i18next
 * This provides the resources object in the format i18next expects
 */

import type {Resource} from 'i18next';
import en from './en';
import ar from './ar';

export default {en, ar} satisfies Resource;
