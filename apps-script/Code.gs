/**
 * U-NIT website orders -> Google Sheet tab "طلبات الموقع" + private Drive photos + email notification.
 * Deploy as a Web app (Execute as: Me, Who has access: Anyone). See README_AR.md.
 */
const CFG = {
  OWNER_EMAIL: 'mangermahmoudmehana@gmail.com',
  TAB: 'طلبات الموقع',
  FOLDER: 'U-NIT طلبات الموقع - صور',
  NOTIFY: ['moustafa.mahmoudx7@gmail.com', 'qa25ws14ed36@gmail.com'],
  MAX_PHOTOS: 5,
  MAX_PHOTO_BYTES: 4 * 1024 * 1024,
  // per photo AFTER the site compresses it
  RATE_LIMIT_PER_10MIN: 40
};
const HEAD = ['Request ID', 'Received at', 'Site language', 'Name', 'Business / Brand', 'Business type', 'WhatsApp / Phone', 'City', 'Products', 'Sizes', 'Quantity', 'Order details', 'Reference link', 'Photos (private Drive links)', 'Preferred contact', 'Email status', 'Email error'];
const COL = {
  ID: 1,
  EMAIL_STATUS: 16,
  EMAIL_ERR: 17
};
function doGet() {
  return out_({
    ok: true,
    service: 'unit-orders'
  });
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const d = JSON.parse(e && e.postData && e.postData.contents || '{}');
    if (d.hp) return out_({
      ok: true
    }); // honeypot: bots fill this
    const err = validate_(d);
    if (err) return out_({
      ok: false,
      error: err
    });
    const sh = sheet_();
    const dup = sh.getRange('A:A').createTextFinder(d.id).matchEntireCell(true).findNext();
    if (dup) return out_({
      ok: true,
      duplicate: true,
      id: d.id
    }); // same request sent twice

    if (!rate_()) return out_({
      ok: false,
      error: 'rate_limited'
    });
    const links = savePhotos_(d);
    const row = [d.id, new Date(), d.lang || '', d.name, d.business, d.type, d.phone, d.city || '', (d.products || []).join(' | '), (d.sizes || []).join(' | '), d.qty, d.details || '', d.ref || '', links.join('\n'), d.contact || '', 'PENDING', ''].map(safe_);
    sh.appendRow(row);
    const rowNum = sh.getLastRow();
    SpreadsheetApp.flush();
    mail_(sh, rowNum, d, links); // order is already saved at this point
    return out_({
      ok: true,
      id: d.id
    });
  } catch (x) {
    return out_({
      ok: false,
      error: 'server_error'
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}
function validate_(d) {
  if (!d || typeof d.id !== 'string' || !/^[\w-]{8,64}$/.test(d.id)) return 'bad_id';
  for (const k of ['name', 'business', 'phone']) if (!d[k] || String(d[k]).length > 300) return 'bad_' + k;
  if (!d.type || !Array.isArray(d.products) || !d.products.length) return 'bad_products';
  if (!Number.isSafeInteger(Number(d.qty)) || Number(d.qty) < 1) return 'bad_qty';
  for (const k of ['name', 'business', 'phone', 'type', 'city', 'contact', 'lang']) {
    if (d[k] != null && (typeof d[k] !== 'string' || d[k].length > 300)) return 'bad_' + k;
  }
  for (const k of ['products', 'sizes']) {
    if (d[k] != null && (!Array.isArray(d[k]) || d[k].length > 40 || d[k].some(v => typeof v !== 'string' || v.length > 300))) return 'bad_' + k;
  }
  if (String(d.details || '').length > 4000 || String(d.ref || '').length > 1000) return 'too_long';
  const p = d.photos || [];
  if (!Array.isArray(p)) return 'bad_photos';
  if (p.length > CFG.MAX_PHOTOS) return 'too_many_photos';
  for (const x of p) {
    if (!x || x.type !== 'image/jpeg' || typeof x.data !== 'string' || !/^\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(x.data) || x.data.length % 4 !== 0) return 'bad_photo';
    if (x.data.length * 0.75 > CFG.MAX_PHOTO_BYTES) return 'photo_too_large';
  }
  return '';
}
function rate_() {
  const c = CacheService.getScriptCache();
  const key = 'requests-' + Math.floor(Date.now() / 600000);
  const n = Number(c.get(key) || 0);
  if (n >= CFG.RATE_LIMIT_PER_10MIN) return false;
  c.put(key, String(n + 1), 600);
  return true;
}
function sheet_() {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('WEBSITE_SHEET_ID'));
  let sh = ss.getSheetByName(CFG.TAB);
  if (!sh) {
    sh = ss.insertSheet(CFG.TAB);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
  }
  return sh;
}
function folder_() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('WEBSITE_PHOTO_FOLDER');
  if (folderId) return DriveApp.getFolderById(folderId);
  const f = DriveApp.createFolder(CFG.FOLDER);
  props.setProperty('WEBSITE_PHOTO_FOLDER', f.getId());
  f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  shareFolder_(f);
  return f;
}
/** Gives the notification accounts view access to the whole folder, once. Safe to run again. */
function shareFolder_(folder) {
  const owner = folder.getOwner().getEmail().toLowerCase();
  const have = folder.getViewers().map(u => u.getEmail().toLowerCase());
  CFG.NOTIFY.forEach(function (m) {
    const e = m.toLowerCase();
    if (e !== owner && have.indexOf(e) === -1) folder.addViewer(m);
  });
}
function savePhotos_(d) {
  const photos = d.photos || [];
  if (!photos.length) return [];
  const f = folder_(),
    links = [];
  const created = [];
  try {
    photos.forEach(function (p, i) {
      const blob = Utilities.newBlob(Utilities.base64Decode(p.data), 'image/jpeg', d.id + '-' + (i + 1) + '.jpg');
      const file = f.createFile(blob);
      created.push(file);
      file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
      links.push(file.getUrl());
    });
  } catch (error) {
    created.forEach(file => file.setTrashed(true));
    throw error;
  }
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
  const rows = [['Name', d.name], ['Business / Brand', d.business], ['WhatsApp / Phone', d.phone], ['City', d.city], ['Business type', d.type], ['Products', (d.products || []).join(', ')], ['Sizes', (d.sizes || []).join(', ')], ['Quantity', d.qty], ['Preferred contact', d.contact], ['Details', d.details], ['Reference link', d.ref], ['Photos', links.join('\n')]];
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[c];
    }).replace(/\n/g, '<br>');
  };
  const html = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial">' + rows.filter(function (r) {
    return r[1];
  }).map(function (r) {
    return '<tr><td style="border:1px solid #ddd"><b>' + r[0] + '</b></td><td style="border:1px solid #ddd">' + esc(r[1]) + '</td></tr>';
  }).join('') + '</table>';
  // One message addressed to both recipients. Retries can repeat delivery after an ambiguous failure.
  MailApp.sendEmail({
    to: CFG.NOTIFY.join(','),
    subject: 'طلب تصنيع جديد من الموقع — ' + d.business + ' (' + d.name + ')',
    htmlBody: html,
    body: rows.map(function (r) {
      return r[0] + ': ' + r[1];
    }).join('\n')
  });
}

/** Re-tries notifications that failed. Run setupRetryTrigger() once to do it automatically every 15 minutes. */
function retryFailedEmails() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const sh = sheet_(),
      n = sh.getLastRow();
    if (n < 2) return;
    const vals = sh.getRange(2, 1, n - 1, HEAD.length).getValues();
    vals.forEach(function (r, i) {
      if (!['FAILED', 'PENDING'].includes(r[COL.EMAIL_STATUS - 1])) return;
      const d = {
        id: r[0],
        name: r[3],
        business: r[4],
        type: r[5],
        phone: r[6],
        city: r[7],
        products: String(r[8]).split(' | '),
        sizes: String(r[9]).split(' | '),
        qty: r[10],
        details: r[11],
        ref: r[12],
        contact: r[14]
      };
      mail_(sh, i + 2, d, String(r[13]).split('\n').filter(String));
    });
  } finally {
    lock.releaseLock();
  }
}
function setupRetryTrigger() {
  const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'retryFailedEmails');
  if (exists) return;
  ScriptApp.newTrigger('retryFailedEmails').timeBased().everyMinutes(15).create();
}
function safe_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor on the factory account. Safe to run again. */
function setupFactory() {
  if (Session.getEffectiveUser().getEmail() !== CFG.OWNER_EMAIL) {
    throw new Error('Run setup using the factory account only.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const props = PropertiesService.getScriptProperties();
    if (!props.getProperty('WEBSITE_SHEET_ID')) {
      const spreadsheet = SpreadsheetApp.create('U-NIT | طلبات الموقع');
      props.setProperty('WEBSITE_SHEET_ID', spreadsheet.getId());
      const sheet = spreadsheet.getSheets()[0];
      sheet.setName(CFG.TAB);
      sheet.appendRow(HEAD);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#e7e2dc');
    }
    const sheet = sheet_();
    const folder = folder_();
    shareFolder_(folder);
    setupRetryTrigger();
    console.log('Orders sheet: ' + sheet.getParent().getUrl());
    console.log('Private photos folder: ' + folder.getUrl());
  } finally {
    lock.releaseLock();
  }
}
