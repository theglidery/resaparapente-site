import consentData from '../../legal/consent-texts.json';

const cleanText = (raw, schoolName) =>
  raw
    .replace(/\{school\}/g, schoolName)
    .replace(/\[\[cgv:([^\]]+)\]\]/g, '$1')
    .replace(/\[\[privacy:([^\]]+)\]\]/g, '$1');

export function validateConsents(consents, schoolName, legacyConsent = false, legacyOptIn = false) {
  if (!consents || typeof consents !== 'object') {
    if (legacyConsent === true) {
      const t = consentData.fr.fr;
      return {
        ok: true,
        cgv: 1,
        partners: legacyOptIn ? 1 : 0,
        version: consentData.version,
        market: 'fr',
        language: 'fr',
        text1: cleanText(t.case1, schoolName),
        text2: cleanText(t.case2, schoolName),
      };
    }
    return { ok: false, error: consentData.fr.fr.error };
  }
  if (consents.cgv !== true) {
    return { ok: false, error: consentData.fr.fr.error };
  }
  if (consents.version !== consentData.version) {
    return { ok: false, error: 'Version de consentement inconnue.' };
  }
  const market = ['fr', 'ch', 'be'].includes(consents.market) ? consents.market : 'fr';
  const marketTexts = consentData[market] || consentData.fr;
  const lang = Object.hasOwn(marketTexts, consents.language) ? consents.language : 'fr';
  const t = marketTexts[lang];
  return {
    ok: true,
    cgv: 1,
    partners: consents.partners === true ? 1 : 0,
    version: consentData.version,
    market,
    language: lang,
    text1: cleanText(t.case1, schoolName),
    text2: cleanText(t.case2, schoolName),
  };
}
