# تجهيز Google Forms لموقع مصنع U-NIT — بالعربي

## الفكرة

- موقع U-NIT مخصص **B2B فقط**: البراندات والتجار والشركات.
- العميل يملأ Google Form **داخل الموقع** داخل iframe، ثم يضغط **إرسال / Submit** من نفس الصفحة.
- الردود تذهب إلى Google Forms، ويمكن ربطها بـ Google Sheets، وتصل **إشعارات عبر البريد** للحساب الذي يفعّلها.
- لن يتصل الموقع بنموذج حقيقي قبل وضع رابط Google Forms الصحيح في `js/config.js`.
- لتغيير اللغة مع الموقع بشكل كامل: أنشئ نموذجًا إنجليزيًا وآخر عربيًا بنفس الأسئلة.

## 1. إنشاء النموذج الإنجليزي

1. افتح https://forms.google.com/ من حساب والدك إن أمكن، ثم **Blank form**.
2. العنوان: `U-NIT | B2B Manufacturing Enquiry`.
3. الوصف: `For brands, wholesalers and businesses only. Share your garment manufacturing requirements. This is an enquiry, not an order confirmation. U-NIT Clothing Factory — established 2011, El Matariya, Cairo.`
4. انسخ الأسئلة والاختيارات من `FORM_QUESTIONS_EN_AR.md` بنفس الترتيب والحقول المطلوبة.
5. من Settings تأكد إن **Limit to 1 response** مقفول، وإن النموذج **لا يطلب تسجيل دخول**، ولا يجمع بريد المستخدم تلقائيًا إلا إذا كنت محتاجه فعلًا.
6. لا تستخدم سؤال `File upload` في البداية، لأنه قد يطلب من العميل تسجيل الدخول بحساب Google. الأفضل سؤال `Link to model/reference photo (optional)`.
7. اضبط رسالة النجاح: `Thanks! Your U-NIT manufacturing enquiry has been received. Our team will review your request and contact you using your provided details.`
8. اضغط **Publish** واسمح لأي شخص معه الرابط بالرد، حسب خيارات حسابك.

## 2. إنشاء النموذج العربي

1. اعمل **Make a copy** للنموذج الإنجليزي.
2. غيّر العنوان إلى `يونت | طلب تصنيع ملابس للتجار والبراندات`.
3. ترجم كل الأسئلة والاختيارات باستخدام ملف `FORM_QUESTIONS_EN_AR.md`.
4. اجعل رسالة النجاح: `شكرًا ليك! استلمنا طلب التصنيع. فريق مصنع يونت هيراجع بياناتك ويتواصل معاك على رقمك.`
5. انشر النموذج العربي بنفس إعدادات الوصول.

## 3. إزاي الطلبات توصل لوالدك؟

أفضل حل: **والدك يعمل النموذجين من حساب Gmail الخاص به**. كده هو صاحب النموذج والردود بتكون عنده. لو عملتهم من حسابك، شارك النموذجين مع Gmail والدك بصلاحية **Editor**. وخليه يفتح النموذج بنفسه، يروح `Responses` ثم `⋮` ويختار **Get email notifications for new responses**. لازم يفعّل الإشعارات من حسابه؛ مشاركة الملف لوحدها مش ضمان إنه هيوصله إيميل مع كل رد.

لترتيب الطلبات في جدول: في Google Forms اختار `Responses` ثم أيقونة Sheets / `Link to Sheets`. تقدر تختار Spreadsheet جديد أو Spreadsheet موجود. في حال وجود نموذجين، اختار نفس ملف Spreadsheet لو حابب، ولكل نموذج تبويب ردود مستقل. **التنبيه إيميل، مش رسالة واتساب تلقائية**.

## 4. إزاي تجيب رابط الـ Embed؟

داخل كل نموذج افتح زر `⋮ More` من أعلى، واختار `Embed HTML` (ممكن يظهر باسم `Embed` أو أيقونة `<>` حسب الواجهة). انسخ كود iframe أو انسخ قيمة `src="..."` منه فقط.

مثال توضيحي **مش رابط حقيقي**:

```html
<iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="640" height="1700" frameborder="0">Loading…</iframe>
```

**المطلوب في `js/config.js` هو الرابط داخل `src` فقط**، وليس كود iframe كله، ولا رابط تعديل النموذج الذي يحتوي على `/edit`، ولا رابط `forms.gle` المختصر.

```js
window.U-NIT_CONFIG = {
  googleFormEn: 'https://docs.google.com/forms/d/e/ENGLISH_FORM_ID/viewform?embedded=true',
  googleFormAr: 'https://docs.google.com/forms/d/e/ARABIC_FORM_ID/viewform?embedded=true',
  whatsappNumber: '',
  facebookUrl: ''
};
```

بعد تعديل الملف، افتح `index.html` عبر VS Code Live Server أو انشر الموقع. النموذج الإنجليزي يظهر في `EN` والعربي في `عربي` **داخل نفس الصفحة من غير ما يضغط العميل على لينك**. يوجد رابط بديل لفتح النموذج في صفحة مستقلة لو المتصفح منع إظهاره.

## 5. اختبار قبل النشر

- افتح الموقع من **Incognito** وأنت مش عامل تسجيل دخول Google؛ افتح اللغتين.
- جرّب تسجيل طلب **تجريبي** في كل نموذج، وتأكد إنه يظهر في `Responses` وGoogle Sheets.
- تأكد أن والدك وصله إشعار إيميل من كل نموذج.
- جرّب على موبايل Android وiPhone لو متاح، وتأكد إن زر Submit ظاهر ويمكن الضغط عليه.
- احذف الطلبين التجريبيين من سجل الردود لو مش عايزهم يدخلوا في بيانات المصنع.
- لا تطلب معلومات شخصية غير ضرورية، ووَضِّح أن البيانات ستُستخدم للرد على استفسار التصنيع فقط.

## ملاحظات مهمة

- Google Forms داخل iframe قد يظهر بشريط تمرير داخلي، ولا يمكن للموقع تحديد ارتفاعه تلقائيًا بسبب قيود الحماية بين النطاقات. عدّل `min-height` في `css/google-form.css` بعد مشاهدة الفورم الفعلي.
- لو بدأ العميل يملأ النموذج ثم غيّر اللغة، ستُحمّل نسخة اللغة الأخرى، وقد تضيع الإجابات غير المُرسلة. اطلب منه اختيار اللغة قبل البدء.
- رابط Google Form لازم يكون منشورًا ومتاحًا للرد من الجميع؛ وإلا ممكن يظهر طلب صلاحية أو رسالة عدم إتاحة.
- لا تستخدم روابط أو أرقام وهمية في الموقع المنشور. الصور الحالية توضيحية حتى يتم تصوير المصنع الحقيقي.

مرجع جوجل الرسمي: https://support.google.com/docs/answer/2839588?hl=en
إشعارات الردود: https://support.google.com/docs/answer/139706?hl=en
