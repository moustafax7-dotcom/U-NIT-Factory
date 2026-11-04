const src = f => typeof IMGS !== 'undefined' && IMGS[f] || `assets/images/${f}.webp`;
const siteConfig = window.NULRA_CONFIG || {},
  $ = s => document.querySelector(s);
let lang = 'en',
  filt = 'all',
  cur = null;
const translate = (en, ar) => lang === 'ar' ? ar : en;
function formUrl(v) {
  try {
    const u = new URL((v || '').trim());
    if (u.protocol !== 'https:' || u.hostname !== 'docs.google.com' || !/^\/forms\/d\/(e\/)?[\w-]+\/viewform\/?$/.test(u.pathname)) return null;
    u.searchParams.set('embedded', 'true');
    return u.href;
  } catch {
    return null;
  }
}
function grid() {
  $('#cnt').textContent = products.length;
  $('#grid').innerHTML = products.map((p, i) => filt === 'all' || p.g === filt ? `<button class="card" data-i="${i}"><img src="${src(p.im[0])}" alt="" loading="lazy">${p.ph ? '<em class="soon">' + translate('Photo soon', 'الصورة قريباً') + '</em>' : ''}<div><h3>${translate(p.en, p.ar)}</h3><span>${p.im.length > 1 ? translate(p.im.length + ' photos', p.im.length + ' صور') + ' · ' : ''}${translate('View', 'شوف')} →</span></div></button>` : '').join('');
}
function showGoogleForm() {
  const u = formUrl(lang === 'ar' ? siteConfig.googleFormAr : siteConfig.googleFormEn);
  $('#ph').hidden = !!u;
  $('#fw').hidden = !u;
  if (u) {
    const f = $('#fr');
    if (f.getAttribute('src') !== u) f.src = u;
    $('#ext').href = u.replace(/([?&])embedded=true(&|$)/, (m, b, a) => a ? b : '');
  }
}
function contact() {
  const w = (siteConfig.whatsappNumber || '').replace(/\D/g, ''),
    f = siteConfig.facebookUrl,
    h = [];
  if (w) h.push(`<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${w}">WhatsApp</a>`);
  if (/^https:\/\/(www\.)?facebook\.com\//.test(f || '')) h.push(`<a class="btn ghost" target="_blank" rel="noopener" href="${f}">Facebook</a>`);
  $('#contact').innerHTML = h.join('');
}
function form() {
  if (nativeOK()) {
    $('#ph').hidden = true;
    $('#fw').hidden = true;
    if ($('#nok').hidden) {
      const f = $('#nf'),
        s = f.children.length ? readFormState() : null;
      f.hidden = false;
      renderOrderForm();
      if (s) restoreFormState(s);
      renderPhotoList();
    }
    return;
  }
  showGoogleForm();
}
function fill() {
  const p = products[cur];
  $('#car').innerHTML = p.im.map(f => `<img src="${src(f)}" alt="">`).join('');
  $('#car').scrollLeft = 0;
  nav();
  $('#dt').textContent = translate(p.en, p.ar);
  $('#dd').textContent = translate(p.de, p.da);
  $('#dc').textContent = translate('Enquire about this', 'اطلب التصنيع');
  $('#cn').hidden = $('#cp').hidden = $('#cx').hidden = p.im.length < 2;
}
function nav() {
  const c = $('#car'),
    n = products[cur].im.length,
    w = c.clientWidth || 1,
    k = Math.min(n, Math.round(Math.abs(c.scrollLeft) / w) + 1);
  $('#cx').textContent = k + ' / ' + n;
}
function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(e => e.textContent = e.dataset[lang]);
  $('#lang').textContent = lang === 'ar' ? 'EN' : 'عربي';
  $('#dx').setAttribute('aria-label', translate('Close', 'إغلاق'));
  grid();
  form();
  contact();
  if (cur !== null) fill();
}
$('#lang').onclick = () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  applyLanguage();
};
document.querySelectorAll('.chip').forEach(b => b.onclick = () => {
  filt = b.dataset.f;
  document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
  grid();
});
$('#grid').onclick = e => {
  const c = e.target.closest('.card');
  if (!c) return;
  cur = +c.dataset.i;
  fill();
  $('#dlg').showModal();
};
$('#car').onscroll = nav;
const go = d => $('#car').scrollBy({
  left: d * $('#car').clientWidth * (document.dir === 'rtl' ? -1 : 1),
  behavior: 'smooth'
});
$('#cn').onclick = () => go(1);
$('#cp').onclick = () => go(-1);
$('#dx').onclick = () => $('#dlg').close();
$('#dlg').onclick = e => {
  if (e.target.id === 'dlg') e.target.close();
};
$('#dc').onclick = () => {
  $('#dlg').close();
  const p = products[cur],
    h = $('#hint');
  h.hidden = false;
  h.textContent = translate(`Interested in ${p.en}? Select the same product in the form below.`, `مهتم بـ ${p.ar}؟ اختار نفس المنتج في الفورم تحت.`);
};
