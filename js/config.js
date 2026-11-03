// U-NIT website configuration. Insert URLs from the actual Google Forms Embed HTML.
// DO NOT paste an edit link, the entire iframe tag, or a forms.gle short link.
// Expected format: https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true
window.NULRA_CONFIG = {
  googleFormEn: 'https://docs.google.com/forms/d/e/1FAIpQLSfogbamkoUnySf11Ba3awMP-6ISJ5MeF15nYpmiuYSCTzq-PQ/viewform?embedded=true', // English form (temporarily the same form as Arabic until the second form is ready)
  googleFormAr: 'https://docs.google.com/forms/d/e/1FAIpQLSfogbamkoUnySf11Ba3awMP-6ISJ5MeF15nYpmiuYSCTzq-PQ/viewform?embedded=true', // Arabic Google Form public EMBED URL
  // Native in-page form (optional). Fill these from the Google Form's pre-filled link (entry.NNNN ids).
  // If left empty the embedded Google Form is shown instead.
  formPreview: true, // true = show the native form design as a non-sending preview
  formLang: 'ar', // language of the option labels inside the real Google Form: 'ar' or 'en'
  formEntries: { name:'', business:'', type:'', phone:'', city:'', products:'', qty:'', sizes:'', details:'', ref:'', contact:'' },
  whatsappNumber: '', // Verified WhatsApp number, e.g. 201xxxxxxxxx
  facebookUrl: '' // Verified Facebook business page
};
