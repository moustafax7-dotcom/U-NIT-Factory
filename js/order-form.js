const orderFields = [{
  k: 'name',
  t: 'text',
  r: 1,
  en: 'Full Name',
  ar: 'الاسم بالكامل'
}, {
  k: 'business',
  t: 'text',
  r: 1,
  en: 'Business / Brand Name',
  ar: 'اسم المحل أو البراند'
}, {
  k: 'type',
  t: 'radio',
  r: 1,
  en: 'Your Business Type',
  ar: 'نوع نشاطك',
  o: [['Clothing brand', 'براند ملابس'], ['Wholesaler', 'تاجر جملة'], ['Retail shop owner (bulk manufacturing only)', 'صاحب محل (تصنيع بالجملة فقط)'], ['Company', 'شركة'], ['Other', 'أخرى']]
}, {
  k: 'phone',
  t: 'tel',
  r: 1,
  en: 'Phone / WhatsApp Number',
  ar: 'رقم التليفون أو واتساب'
}, {
  k: 'city',
  t: 'text',
  en: 'City / Governorate',
  ar: 'المدينة / المحافظة'
}, {
  k: 'products',
  t: 'check',
  r: 1,
  en: 'What would you like to manufacture?',
  ar: 'عايز تصنّع إيه؟',
  o: [['T-Shirts', 'تيشيرتات'], ['Polo Shirts', 'بولو شيرت'], ['Shorts', 'شورتات'], ["Men's Pants", 'بناطيل رجالي'], ["Women's Pants (Wide-Leg / Charleston)", 'بناطيل حريمي (وايد ليج / شارلستون)'], ['Sets', 'أطقم'], ['Sweatshirts', 'سويت شيرتات'], ['Hoodies', 'هوديز'], ['Sweatpants', 'سراويل'], ['Other / Custom Style', 'موديل مختلف / تصميم خاص']]
}, {
  k: 'qty',
  t: 'number',
  r: 1,
  en: 'Estimated Quantity (pieces)',
  ar: 'الكمية المتوقعة (بالقطعة)'
}, {
  k: 'sizes',
  t: 'check',
  en: 'Sizes Needed',
  ar: 'المقاسات المطلوبة',
  o: [['XS', 'XS'], ['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL'], ['XXL', 'XXL'], ['Other / Custom', 'مقاسات خاصة']]
}, {
  k: 'details',
  t: 'area',
  en: 'Details of Your Order',
  ar: 'تفاصيل طلب التصنيع'
}, {
  k: 'ref',
  t: 'url',
  en: 'Reference / Design Image Link',
  ar: 'رابط صورة الموديل أو التصميم'
}, {
  k: 'photos',
  t: 'photo'
}, {
  k: 'contact',
  t: 'radio',
  en: 'Preferred Contact Method',
  ar: 'طريقة التواصل المفضلة',
  o: [['WhatsApp', 'واتساب'], ['Phone call', 'مكالمة هاتف']]
}];
const orderEndpoint = siteConfig.orderEndpoint || '',
  hasOrderEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(orderEndpoint),
  canSubmitOrders = hasOrderEndpoint && !siteConfig.formPreview;
const nativeOK = () => !!siteConfig.formPreview || hasOrderEndpoint;
const formSections = {
  name: [1, 'Your details', 'بياناتك'],
  products: [2, 'Your order', 'طلبك'],
  details: [3, 'Extras', 'تفاصيل إضافية']
};
const maxPhotos = 5,
  maxPhotoMB = 10;
let selectedPhotos = [],
  requestId = null,
  isSending = false,
  isPreparingPhotos = false;
const uid = () => window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
const esc = s => String(s).replace(/[&<>"]/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
})[c]);
const ov = o => o[0] === o[1] ? o[0] : o[0] + ' / ' + o[1];
function readFormState() {
  const s = {};
  $('#nf').querySelectorAll('input:not([type=file]),textarea').forEach(i => {
    if (i.type === 'checkbox' || i.type === 'radio') {
      if (i.checked) (s[i.name] = s[i.name] || []).push(i.value);
    } else s[i.name] = i.value;
  });
  return s;
}
function restoreFormState(s) {
  Object.keys(s).forEach(k => $('#nf').querySelectorAll(`[name="${k}"]`).forEach(i => {
    if (i.type === 'checkbox' || i.type === 'radio') i.checked = s[k].includes(i.value);else i.value = s[k];
  }));
}
function renderOrderForm() {
  const f = $('#nf');
  f.innerHTML = (siteConfig.formPreview ? `<div class="pv">${translate('Design preview only. This form is not connected yet and nothing is sent.', 'معاينة للشكل فقط. الفورم لسه مش متوصّل ومفيش حاجة بتتبعت.')}</div>` : '') + '<input type="text" name="hp" value="" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;opacity:0;width:0;height:0;padding:0;border:0;pointer-events:none">' + orderFields.map(q => {
    const L = q.t === 'photo' ? '' : translate(q.en, q.ar) + (q.r ? ' <span class="req">*</span>' : '');
    let b;
    if (q.t === 'radio' || q.t === 'check') b = `<fieldset><legend>${L}</legend><div class="opts">${q.o.map(o => `<label><input type="${q.t === 'radio' ? 'radio' : 'checkbox'}" name="${q.k}" value="${esc(ov(o))}">${translate(o[0], o[1])}</label>`).join('')}</div></fieldset>`;else if (q.t === 'area') b = `<label>${L}<textarea name="${q.k}" rows="4"></textarea></label>`;else if (q.t === 'photo') b = `<input type="file" id="pf" accept="image/*" multiple hidden><button type="button" class="btn ghost" id="pb"></button><ul class="pl" id="pl"></ul><p class="note" style="margin:8px 0 0">${translate('Optional. Up to 5 photos, 10 MB each. You can also use the link above, or leave both empty.', 'اختياري. لحد 5 صور، كل صورة لحد 10 ميجا. وتقدر تستخدم الرابط اللي فوق، أو تسيب الاتنين فاضيين.')}</p>`;else b = `<label>${L}<input type="${q.t}" name="${q.k}"${q.t === 'number' ? ' min="1" inputmode="numeric"' : ''}${q.t === 'tel' ? ' inputmode="tel"' : ''}></label>`;
    const g = formSections[q.k] ? `<div class="ng"><i>${formSections[q.k][0]}</i>${translate(formSections[q.k][1], formSections[q.k][2])}</div>` : '';
    return g + `<div data-q="${q.k}" class="${['text', 'tel', 'number', 'url'].includes(q.t) ? '' : 'full'}">${b}<div class="nerr" hidden></div></div>`;
  }).join('') + `<div id="serr" class="pv bad" role="alert" hidden></div><button class="btn" type="submit">${translate('Send request', 'إرسال الطلب')}</button><p class="note" style="margin:0">${translate('We use your details only to reply to your request.', 'هنستخدم بياناتك للرد على طلبك فقط.')}</p>`;
}
function renderPhotoList(msgs) {
  const l = $('#pl');
  if (!l) return;
  l.innerHTML = selectedPhotos.map((p, i) => `<li><img src="${p.url}" alt=""><span>${esc(p.name)}</span><button type="button" class="prm" data-i="${i}" aria-label="${translate('Remove photo', 'إزالة الصورة')}">×</button></li>`).join('');
  const e = l.closest('[data-q]').querySelector('.nerr');
  e.textContent = (msgs || []).join(' · ');
  e.hidden = !(msgs && msgs.length);
  $('#pb').textContent = selectedPhotos.length ? translate('Add another photo', 'أضف صورة تانية') : translate('Upload model photo (optional)', 'ارفع صورة الموديل (اختياري)');
  $('#pb').disabled = selectedPhotos.length >= maxPhotos;
}
const loadImg = f => new Promise((ok, no) => {
  const u = URL.createObjectURL(f),
    im = new Image();
  im.onload = () => {
    URL.revokeObjectURL(u);
    ok(im);
  };
  im.onerror = () => {
    URL.revokeObjectURL(u);
    no();
  };
  im.src = u;
});
async function preparePhoto(f) {
  const im = await loadImg(f),
    s = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)),
    c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.naturalWidth * s));
  c.height = Math.max(1, Math.round(im.naturalHeight * s));
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(im, 0, 0, c.width, c.height);
  const d = c.toDataURL('image/jpeg', .8);
  return {
    name: f.name.replace(/\.[^.]+$/, '') + '.jpg',
    type: 'image/jpeg',
    data: d.split(',')[1],
    url: d
  };
}
async function addFiles(list) {
  if (isPreparingPhotos || isSending) return;
  isPreparingPhotos = true;
  const submitButton = $('#nf button[type=submit]');
  submitButton.disabled = true;
  $('#pb').disabled = true;
  const m = [];
  for (const f of list) {
    if (selectedPhotos.length >= maxPhotos) {
      m.push(translate('Maximum 5 photos.', 'الحد الأقصى 5 صور.'));
      break;
    }
    if (!/^image\//.test(f.type)) {
      m.push(`${f.name}: ${translate('not an image file', 'مش ملف صورة')}`);
      continue;
    }
    if (f.size > maxPhotoMB * 1048576) {
      m.push(`${f.name}: ${translate('larger than 10 MB', 'أكبر من 10 ميجا')}`);
      continue;
    }
    try {
      selectedPhotos.push(await preparePhoto(f));
    } catch (_) {
      m.push(`${f.name}: ${translate('could not be read, try a JPG or PNG', 'ماقدرناش نقراها، جرّب JPG أو PNG')}`);
    }
  }
  isPreparingPhotos = false;
  submitButton.disabled = false;
  renderPhotoList(m);
}
function collectOrder() {
  const f = $('#nf'),
    a = {},
    bad = [];
  orderFields.forEach(q => {
    if (q.t === 'photo') return;
    const box = f.querySelector(`[data-q="${q.k}"]`),
      err = box.querySelector('.nerr');
    let v;
    if (q.t === 'check') v = [...f.querySelectorAll(`[name="${q.k}"]:checked`)].map(i => i.value);else if (q.t === 'radio') {
      const c = f.querySelector(`[name="${q.k}"]:checked`);
      v = c ? [c.value] : [];
    } else v = [f.querySelector(`[name="${q.k}"]`).value.trim()].filter(Boolean);
    let m = '';
    if (q.r && !v.length) m = translate('Required', 'مطلوب');else if (q.t === 'number' && v.length && !(+v[0] >= 1)) m = translate('Enter 1 or more', 'اكتب رقم 1 أو أكتر');else if (q.t === 'url' && v.length && !/^https?:\/\/\S+$/i.test(v[0])) m = translate('Enter a valid link', 'اكتب لينك صحيح');else if (q.t === 'tel' && v.length && v[0].replace(/\D/g, '').length < 7) m = translate('Enter a valid number', 'اكتب رقم صحيح');
    err.textContent = m;
    err.hidden = !m;
    box.classList.toggle('bad', !!m);
    if (m) bad.push(box);
    a[q.k] = q.t === 'check' ? v : v[0] || '';
  });
  return {
    a,
    bad
  };
}
function done(msgEn, msgAr) {
  const f = $('#nf'),
    o = $('#nok');
  f.hidden = true;
  o.dataset.en = msgEn;
  o.dataset.ar = msgAr;
  o.textContent = translate(msgEn, msgAr);
  o.hidden = false;
  o.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}
async function submitOrder(e) {
  e.preventDefault();
  if (isSending || isPreparingPhotos) return;
  const f = $('#nf'),
    se = $('#serr');
  se.hidden = true;
  const {
    a,
    bad
  } = collectOrder();
  if (bad.length) {
    bad[0].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    return;
  }
  if (!canSubmitOrders) {
    done('Preview only: the form is not connected yet, so nothing was sent.', 'معاينة فقط: الفورم لسه مش متوصّل فمفيش حاجة اتبعتت.');
    return;
  }
  requestId = requestId || uid();
  const btn = f.querySelector('button[type=submit]');
  isSending = true;
  btn.disabled = true;
  btn.textContent = translate('Sending…', 'جاري الإرسال…');
  const payload = {
    id: requestId,
    lang: document.documentElement.lang,
    hp: f.querySelector('[name=hp]').value,
    ...a,
    photos: selectedPhotos.map(p => ({
      name: p.name,
      type: p.type,
      data: p.data
    }))
  };
  const ctl = new AbortController(),
    to = setTimeout(() => ctl.abort(), 60000);
  try {
    const r = await fetch(orderEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: ctl.signal,
      redirect: 'follow'
    });
    const j = await r.json();
    if (!r.ok || !j || j.ok !== true || j.id !== requestId) throw new Error(j && j.error || 'server');
    selectedPhotos = [];
    requestId = null;
    done('Your request has been received. We will review it and contact you.', 'تم استلام طلبك. هنراجعه ونتواصل معاك.');
  } catch (x) {
    se.textContent = translate('We could not send your request. Your details are still here. Please check your connection and press Send again.', 'ماقدرناش نبعت طلبك. بياناتك لسه موجودة. اتأكد من النت واضغط إرسال تاني.');
    se.hidden = false;
    se.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } finally {
    clearTimeout(to);
    isSending = false;
    btn.disabled = false;
    btn.textContent = translate('Send request', 'إرسال الطلب');
  }
}
$('#nf').addEventListener('submit', submitOrder);
$('#nf').addEventListener('click', e => {
  if (e.target.closest('#pb')) $('#pf').click();
  const r = e.target.closest('.prm');
  if (r) {
    selectedPhotos.splice(+r.dataset.i, 1);
    renderPhotoList();
  }
});
$('#nf').addEventListener('change', e => {
  if (e.target.id === 'pf') {
    const l = [...e.target.files];
    e.target.value = '';
    addFiles(l);
  }
});

applyLanguage();
