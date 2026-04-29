// Pilot configuration. Edit this file before building for the pilot.
//
// IMPORTANT FOR PIPER: replace NURSE_PHONE_INTL with your real phone number
// in international format, e.g. '+233244123456'. No spaces, no dashes.
//
// VERSION: shown in the Profile tab. Bump when you cut a new pilot build.

export const PILOT = {
  isPilot: true,                 // shows "Pilot" badge on home screen
  versionLabel: 'v1.3 pilot',
  nursePhoneIntl: '+233247294235', // <-- REPLACE WITH YOUR NUMBER
  nurseName: 'Nurse',              // shown in feedback prompts
}

// WhatsApp opens via wa.me link
export function getWhatsAppLink(message) {
  // Strip any '+' or non-digits
  const num = PILOT.nursePhoneIntl.replace(/[^\d]/g, '')
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${num}?text=${text}`
}

// SMS link (works on basic phones too)
export function getSmsLink(message) {
  const num = PILOT.nursePhoneIntl
  const text = encodeURIComponent(message || '')
  // Android format
  return `sms:${num}?body=${text}`
}
