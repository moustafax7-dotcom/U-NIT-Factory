const products = [{
  g: 'tops',
  en: 'Ringer T-Shirt',
  ar: 'تيشيرت رينجر',
  de: 'Classic tee with contrast collar and sleeve trim.',
  da: 'تيشيرت كلاسيك بياقة وأكمام بلون مختلف.',
  im: ['tshirts-1', 'tshirts-2', 'ringer-3', 'ringer-4', 'ringer-5']
}, {
  g: 'tops',
  en: 'Layered Hem Distressed T-Shirt',
  ar: 'تيشيرت بحافة مقطّعة وطبقتين',
  de: 'Oversized tee with a layered distressed hem and sleeve patch, in four colours.',
  da: 'تيشيرت واسع بحافة مقطّعة بطبقتين وقطعة على الكم، بأربع ألوان.',
  im: ['tees-1']
}, {
  g: 'tops',
  en: 'Raw-Seam T-Shirt',
  ar: 'تيشيرت بخياطة خام',
  de: 'Oversized tee with exposed raw seams and a rubber patch, in four colours.',
  da: 'تيشيرت واسع بخياطة خام ظاهرة وليبل مطاطي، بأربع ألوان.',
  im: ['tees-2']
}, {
  g: 'tops',
  en: 'Polo Shirts',
  ar: 'بولو شيرت',
  de: 'Knit polo with a ribbed texture, in burgundy, black, white and olive.',
  da: 'بولو تريكو بخطوط بارزة، بوردو وأسود وأبيض وزيتي.',
  im: ['polo-1', 'polo-2', 'polo-3', 'polo-4']
}, {
  g: 'tops',
  en: 'Piped Zip Hoodie',
  ar: 'هودي بسوستة وشريط أبيض',
  de: 'Oversized hoodie with a contrast white piping and half zip, in black and beige.',
  da: 'هودي واسع بنص سوستة وشريط أبيض على الحواف، أسود وبيج.',
  im: ['hoodp-1', 'hoodp-2']
}, {
  g: 'tops',
  en: 'Colour-Block Hoodie',
  ar: 'هودي بغطا مختلف اللون',
  de: 'Pullover hoodie with a contrast hood and layered hem, in several colours.',
  da: 'هودي بدون سوستة بغطا بلون مختلف وحافة مزدوجة، بألوان مختلفة.',
  im: ['hoodc-1', 'hoodc-2']
}, {
  g: 'tops',
  en: 'Sweatshirts',
  ar: 'سويت شيرتات',
  de: 'Sweatshirts for the cooler seasons.',
  da: 'سويت شيرتات للمواسم الباردة.',
  im: ['product_6'],
  ph: 1
}, {
  g: 'bottoms',
  en: 'Pocket Shorts',
  ar: 'شورت بجيوب',
  de: 'Soft sweat shorts with front pockets, in several colours.',
  da: 'شورت قطن ناعم بجيوب قدّامية وبألوان مختلفة.',
  im: ['shorts-1', 'shorts-2']
}, {
  g: 'bottoms',
  en: 'Distressed Side-Stripe Shorts',
  ar: 'شورت مقطّع بشريط جانبي',
  de: 'Washed look with distressing and a side stripe.',
  da: 'شورت بغسلة وتقطيع وشريط جانبي.',
  im: ['shorts-10', 'shorts-3']
}, {
  g: 'bottoms',
  en: 'Embossed Logo Shorts',
  ar: 'شورت بشعار بارز',
  de: 'Soft sweat shorts with a large embossed lettering, in black, white and green.',
  da: 'شورت قطن ناعم بكتابة بارزة كبيرة، أسود وأبيض وأخضر.',
  im: ['shorts-11']
}, {
  g: 'bottoms',
  en: 'Wide Shorts with Clip',
  ar: 'شورت واسع بكليب',
  de: 'Relaxed wide-cut shorts with a metal clip.',
  da: 'شورت واسع مريح بكليب معدن.',
  im: ['shorts-8', 'shorts-4', 'shorts-9']
}, {
  g: 'bottoms',
  en: 'Cargo Shorts',
  ar: 'شورت كارجو',
  de: 'Cargo shorts with large flap pockets.',
  da: 'شورت كارجو بجيوب كبيرة بغطا.',
  im: ['shorts-6', 'shorts-7', 'shorts-5']
}, {
  g: 'bottoms',
  en: "Men's Pants",
  ar: 'بناطيل رجالي',
  de: "Men's pants.",
  da: 'بناطيل رجالي.',
  im: ['product_3'],
  ph: 1
}, {
  g: 'bottoms',
  en: "Wide-Leg Pants (Women)",
  ar: 'بنطلون وايد ليج حريمي',
  de: 'Plain wide-leg pants for women.',
  da: 'بنطلون وايد ليج سادة حريمي.',
  im: ['mpants-1']
}, {
  g: 'bottoms',
  en: 'Striped Wide-Leg Pants (Women)',
  ar: 'وايد ليج بخطوط حريمي',
  de: 'Wide-leg pants with twin side stripes.',
  da: 'بنطلون وايد ليج بخطين جانبيين حريمي.',
  im: ['wpants-1', 'wpants-5']
}, {
  g: 'bottoms',
  en: 'Charleston Pants with Stripes (Women)',
  ar: 'بنطلون شارلستون بخطوط حريمي',
  de: 'Fitted at the top and flared below, with side stripes.',
  da: 'ضيق من فوق ومتوسّع من تحت بخطوط جانبية، حريمي.',
  im: ['wpants-2']
}, {
  g: 'bottoms',
  en: 'Charleston Pants with Slit (Women)',
  ar: 'بنطلون شارلستون بفتحة حريمي',
  de: 'Fitted and flared with a slit at the hem.',
  da: 'ضيق ومتوسّع من تحت بفتحة عند الأسفل، حريمي.',
  im: ['wpants-3', 'wpants-6']
}, {
  g: 'bottoms',
  en: 'Charleston Pants with Wide Stripe (Women)',
  ar: 'بنطلون شارلستون بخط عريض حريمي',
  de: 'Fitted and flared with a bold side stripe.',
  da: 'ضيق ومتوسّع من تحت بخط جانبي عريض، حريمي.',
  im: ['wpants-4']
}, {
  g: 'bottoms',
  en: 'Leggings (Women)',
  ar: 'ليجن حريمي',
  de: 'High-waist fitted leggings.',
  da: 'ليجن ضيق بخصر عالي، حريمي.',
  im: ['wpants-7']
}, {
  g: 'bottoms',
  en: 'Cargo Sweatpants',
  ar: 'سروال كارجو',
  de: 'Relaxed fleece sweatpants with large cargo pockets and drawcord hems.',
  da: 'سروال قطن مبطّن مريح بجيوب كارجو كبيرة وأستك سحاب عند الأسفل.',
  im: ['sweatpants-1']
}, {
  g: 'sets',
  en: 'Zip Jacket Set',
  ar: 'طقم جاكيت بسوستة',
  de: 'High-collar zip jacket with matching pants, in black and grey.',
  da: 'جاكيت بياقة عالية وسوستة مع بنطلون بنفس القماش، أسود ورمادي.',
  im: ['sets-1', 'sets-2', 'sets-3', 'sets-4', 'sets-12']
}, {
  g: 'sets',
  en: 'Clasp Hoodie Set',
  ar: 'طقم هودي بمشابك',
  de: 'Hoodie with metal clasps and matching pants, in several colours.',
  da: 'هودي بمشابك معدن مع بنطلون بنفس القماش وبألوان مختلفة.',
  im: ['hoodies-1', 'hoodies-2', 'sets-5', 'sets-7', 'sets-6', 'sets-8', 'sets-9']
}, {
  g: 'sets',
  en: 'Sleeveless Hoodie & Shorts Set',
  ar: 'طقم هودي بدون أكمام وشورت',
  de: 'Sleeveless hoodie with matching shorts and embroidered text, in black, white and cream.',
  da: 'هودي بدون أكمام مع شورت بنفس القماش وتطريز، أسود وأبيض وكريم.',
  im: ['sets-10', 'sets-11']
}, {
  g: 'sets',
  en: 'Hoodie Set',
  ar: 'طقم هودي',
  de: 'Zip and pullover hoodies with matching pants.',
  da: 'هوديز بسوستة وبدون مع بنطلون بنفس القماش.',
  im: ['hoodies-3', 'sets-14', 'sets-15', 'sets-13']
}];
