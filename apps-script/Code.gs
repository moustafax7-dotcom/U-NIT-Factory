/**
 * U-NIT website orders -> Google Sheet tab "طلبات الموقع" + private Drive photos + email notification.
 * Deploy as a Web app (Execute as: Me, Who has access: Anyone). See README_AR.md.
 */
const CFG = {
  SHEET_ID: '1J_UQ6YsZKII-5XJxHWgaeSM92HblBDBNPrFbWZkA_tc',
  TAB: 'طلبات الموقع',
  FOLDER: 'U-NIT طلبات الموقع - صور',
  NOTIFY: ['moustafa.mahmoudx7@gmail.com', 'qa25ws14ed36@gmail.com'],
  MAX_PHOTOS: 5,
  MAX_PHOTO_BYTES: 4 * 1024 * 1024,   // per photo AFTER the site compresses it
  RATE_LIMIT_PER_10MIN: 40
};
const HEAD = ['Request ID', 'Received at', 'Site language', 'Name', 'Business / Brand', 'Business type',
  'WhatsApp / Phone', 'City', 'Products', 'Sizes', 'Quantity', 'Order details', 'Reference link',
  'Photos (private Drive links)', 'Preferred contact', 'Email status', 'Email error'];
const COL = { ID: 1, EMAIL_STATUS: 16, EMAIL_ERR: 17 };

function doGet() { return out_({ ok: true, service: 'unit-orders' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.hp) return out_({ ok: true });                       // honeypot: bots fill this
    const err = validate_(d);
    if (err) return out_({ ok: false, error: err });
    if (!rate_()) return out_({ ok: false, error: 'rate_limited' });

    const sh = sheet_();
    const dup = sh.getRange('A:A').createTextFinder(d.id).matchEntireCell(true).findNext();
    if (dup) return out_({ ok: true, duplicate: true, id: d.id });      // same request sent twice

    const links = savePhotos_(d);
    const row = [d.id, new Date(), d.lang || '', d.name, d.business, d.type, d.phone, d.city || '',
      (d.products || []).join(' | '), (d.sizes || []).join(' | '), d.qty, d.details || '', d.ref || '',
      links.join('\n'), d.contact || '', 'PENDING', ''].map(safe_);
    sh.appendRow(row);
    const rowNum = sh.getLastRow();
    lock.releaseLock();

    mail_(sh, rowNum, d, links);                                    // order is already saved at this point
    return out_({ ok: true, id: d.id });
  } catch (x) {
    return out_({ ok: false, error: 'server_error' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function validate_(d) {
  if (!d || !d.id || !/^[\w-]{8,64}$/.test(d.id)) return 'bad_id';
  for (const k of ['name', 'business', 'phone']) if (!d[k] || String(d[k]).length > 300) return 'bad_' + k;
  if (!d.type || !Array.isArray(d.products) || !d.products.length) return 'bad_products';
  if (!(Number(d.qty) >= 1)) return 'bad_qty';
  if (String(d.details || '').length > 4000 || String(d.ref || '').length > 1000) return 'too_long';
  const p = d.photos || [];
  if (p.length > CFG.MAX_PHOTOS) return 'too_many_photos';
  for (const x of p) {
    if (!x || x.type !== 'image/jpeg' || !x.data) return 'bad_photo';
    if (x.data.length * 0.75 > CFG.MAX_PHOTO_BYTES) return 'photo_too_large';
  }
  return '';
}

function rate_() {
  const c = CacheService.getScriptCache(), n = Number(c.get('n') || 0);
  if (n >= CFG.RATE_LIMIT_PER_10MIN) return false;
  c.put('n', String(n + 1), 600);
  return true;
}

function sheet_() {
  const ss = SpreadsheetApp.openById(CFG.SHEET_ID);
  let sh = ss.getSheetByName(CFG.TAB);
  if (!sh) { sh = ss.insertSheet(CFG.TAB); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}

function folder_() {
  const it = DriveApp.getFoldersByName(CFG.FOLDER);
  const f = it.hasNext() ? it.next() : DriveApp.createFolder(CFG.FOLDER);
  f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  return f;
}

function savePhotos_(d) {
  const photos = d.photos || [];
  if (!photos.length) return [];
  const f = folder_(), links = [];
  photos.forEach(function (p, i) {
    const blob = Utilities.newBlob(Utilities.base64Decode(p.data), 'image/jpeg', d.id + '-' + (i + 1) + '.jpg');
    const file = f.createFile(blob);
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    CFG.NOTIFY.forEach(function (m) { try { file.addViewer(m); } catch (_) {} });
    links.push(file.getUrl());
  });
  return links;
}

function mail_(sh, rowNum, d, links) {
  try {
    sendMail_(d, links);
    sh.getRange(rowNum, COL.EMAIL_STATUS, 1, 2).setValues([['SENT', '']]);
  } catch (x) {
    sh.getRange(rowNum, COL.EMAIL_STATUS, 1, 2).setValues([['FAILED', String(x).slice(0, 300)]]);
  }
}

function sendMail_(d, links) {
  const rows = [['Name', d.name], ['Business / Brand', d.business], ['WhatsApp / Phone', d.phone], ['City', d.city],
    ['Business type', d.type], ['Products', (d.products || []).join(', ')], ['Sizes', (d.sizes || []).join(', ')],
    ['Quantity', d.qty], ['Preferred contact', d.contact], ['Details', d.details], ['Reference link', d.ref],
    ['Photos', links.join('\n')]];
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }).replace(/\n/g, '<br>'); };
  const html = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial">' + rows.filter(function (r) { return r[1]; })
    .map(function (r) { return '<tr><td style="border:1px solid #ddd"><b>' + r[0] + '</b></td><td style="border:1px solid #ddd">' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
  // one message, addressed to both accounts: each address gets exactly one notification
  MailApp.sendEmail({ to: CFG.NOTIFY.join(','), subject: 'طلب تصنيع جديد من الموقع — ' + d.business + ' (' + d.name + ')', htmlBody: html, body: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') });
}

/** Re-tries notifications that failed. Run setupRetryTrigger() once to do it automatically every 15 minutes. */
function retryFailedEmails() {
  const sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return;
  const vals = sh.getRange(2, 1, n - 1, HEAD.length).getValues();
  vals.forEach(function (r, i) {
    if (r[COL.EMAIL_STATUS - 1] !== 'FAILED') return;
    const d = { id: r[0], name: r[3], business: r[4], type: r[5], phone: r[6], city: r[7], products: String(r[8]).split(' | '),
      sizes: String(r[9]).split(' | '), qty: r[10], details: r[11], ref: r[12], contact: r[14] };
    mail_(sh, i + 2, d, String(r[13]).split('\n').filter(String));
  });
}
function setupRetryTrigger() { ScriptApp.newTrigger('retryFailedEmails').timeBased().everyMinutes(15).create(); }

function safe_(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
