// U-NIT website configuration. Insert URLs from the actual Google Forms Embed HTML.
// DO NOT paste an edit link, the entire iframe tag, or a forms.gle short link.
// Expected format: https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true
window.NULRA_CONFIG = {
  googleFormEn: 'https://docs.google.com/forms/d/e/1FAIpQLSfogbamkoUnySf11Ba3awMP-6ISJ5MeF15nYpmiuYSCTzq-PQ/viewform?embedded=true', // English form (temporarily the same form as Arabic until the second form is ready)
  googleFormAr: 'https://docs.google.com/forms/d/e/1FAIpQLSfogbamkoUnySf11Ba3awMP-6ISJ5MeF15nYpmiuYSCTzq-PQ/viewform?embedded=true', // Arabic Google Form public EMBED URL
  formPreview: false, // false = orders are really sent to orderEndpoint. true = non-sending design preview.
  // Order endpoint = the deployed Google Apps Script web app (see apps-script/README_AR.md).
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbxryeSX22jo__YeZY3QoNm0MD1wV5f9iatNGh-vSpT-KYPtRp-hF9WcnhEK8pMCaC6ePg/exec', // https://script.google.com/macros/s/XXXX/exec
  whatsappNumber: '', // Verified WhatsApp number, e.g. 201xxxxxxxxx
  facebookUrl: '' // Verified Facebook business page
};
