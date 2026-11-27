type Row = readonly [en: string, ar: string, hi: string, ur: string, tl: string];

const rows = {
  "suggestion.help": ["Need help describing this job?", "هل تحتاج إلى مساعدة في وصف هذا العمل؟", "इस काम का वर्णन करने में मदद चाहिए?", "اس کام کی تفصیل لکھنے میں مدد چاہیے؟", "Kailangan mo ng tulong sa paglalarawan ng trabahong ito?"],
  "suggestion.find": ["Find ideas for your kind of work", "ابحث عن أفكار تناسب عملك", "अपने काम के लिए वाक्य ढूँढें", "اپنے کام کے لیے جملے تلاش کریں", "Maghanap ng mga halimbawang angkop sa trabaho mo"],
  "suggestion.forRole": ["Suggested wording for {role}", "عبارات مقترحة لـ{role}", "{role} के लिए सुझाए गए वाक्य", "{role} کے لیے تجویز کردہ جملے", "Mga mungkahing linya para sa {role}"],
  "suggestion.areaPrompt": ["Which kind of work is this closest to?", "ما نوع العمل الأقرب إلى عملك؟", "यह काम किस तरह के काम से सबसे ज़्यादा मिलता है?", "یہ کام کس قسم کے کام سے سب سے زیادہ ملتا ہے؟", "Anong uri ng trabaho ang pinakamalapit dito?"],
  "suggestion.pickType": ["Pick a type of work", "اختر نوع العمل", "काम का प्रकार चुनें", "کام کی قسم منتخب کریں", "Pumili ng uri ng trabaho"],
  "suggestion.chooseOne": ["Choose one", "اختر واحدًا", "एक चुनें", "ایک منتخب کریں", "Pumili ng isa"],
  "suggestion.noMatch": ["No close match? Use your own words above.", "لم تجد نوعًا مناسبًا؟ صف عملك بكلماتك في الأعلى.", "मिलता-जुलता काम नहीं मिला? ऊपर अपने शब्दों में लिखें।", "ملتا جلتا کام نہیں ملا؟ اوپر اپنے الفاظ میں لکھیں۔", "Walang malapit na tugma? Ilarawan ang trabaho mo sa sarili mong salita sa itaas."],
  "suggestion.keepType": ["Keep this work type", "أبقِ نوع العمل الحالي", "इसी प्रकार का काम रखें", "کام کی یہی قسم رکھیں", "Panatilihin ang uring ito"],
  "suggestion.changeType": ["Change type of work", "غيّر نوع العمل", "काम का प्रकार बदलें", "کام کی قسم بدلیں", "Palitan ang uri ng trabaho"],
  "suggestion.truth": ["Tap a sentence only if you did this work. You can change the wording after adding it.", "اختر العبارة فقط إذا نفّذت هذا العمل. يمكنك تعديلها بعد إضافتها.", "वाक्य तभी चुनें जब आपने यह काम किया हो। जोड़ने के बाद आप शब्द बदल सकते हैं।", "جملہ صرف تب منتخب کریں جب آپ نے یہ کام کیا ہو۔ شامل کرنے کے بعد الفاظ بدل سکتے ہیں۔", "Piliin ang pangungusap kung ginawa mo ang trabahong iyon. Maaari mo itong baguhin pagkatapos idagdag."],
  "suggestion.englishCv": ["We add selected suggestions to your CV in English.", "نضيف العبارات التي تختارها إلى سيرتك الذاتية بالإنجليزية.", "हम चुने हुए सुझाव आपके सीवी में अंग्रेज़ी में जोड़ते हैं।", "ہم منتخب تجاویز آپ کے سی وی میں انگریزی میں شامل کرتے ہیں۔", "Idinadagdag namin sa CV mo sa English ang mga mungkahing pinili mo."],
  "suggestion.fewer": ["Show fewer suggestions", "اعرض اقتراحات أقل", "कम सुझाव दिखाएँ", "کم تجاویز دکھائیں", "Magpakita ng mas kaunting mungkahi"],
  "suggestion.more": ["Show {count} more suggestions", "اعرض اقتراحات أخرى ({count})", "{count} और सुझाव दिखाएँ", "مزید {count} تجاویز دکھائیں", "Magpakita ng {count} pang mungkahi"],
  "suggestion.added": ["Added. Edit the sentence if you need to.", "أضفنا العبارة. عدّلها إذا أردت.", "वाक्य जोड़ दिया। ज़रूरत हो तो इसे बदलें।", "جملہ شامل ہو گیا۔ ضرورت ہو تو اسے بدلیں۔", "Naidagdag na. Baguhin ang pangungusap kung kailangan."],
  "suggestion.area.hotel": ["Hotel and food", "الفنادق والطعام", "होटल और खाना", "ہوٹل اور کھانا", "Hotel at pagkain"],
  "suggestion.area.shops": ["Shops and service", "المتاجر وخدمة العملاء", "दुकान और ग्राहक सेवा", "دکان اور گاہکوں کی خدمت", "Tindahan at serbisyo sa customer"],
  "suggestion.area.office": ["Office and school", "المكاتب والمدارس", "दफ़्तर और स्कूल", "دفتر اور اسکول", "Opisina at paaralan"],
  "suggestion.area.transport": ["Transport and stock", "النقل والمخزون", "यातायात और माल का भंडार", "نقل و حمل اور سامان", "Transportasyon at imbentaryo"],
  "suggestion.area.trades": ["Trades and safety", "المهن الفنية والسلامة", "कारीगरी और सुरक्षा", "فنی کام اور حفاظت", "Teknikal na trabaho at kaligtasan"],
  "suggestion.area.care": ["Care and fitness", "الرعاية واللياقة", "देखभाल और फ़िटनेस", "دیکھ بھال اور فٹنس", "Pag-aalaga at fitness"],
  "suggestion.details": ["Add real details (optional)", "أضف تفاصيل من عملك (اختياري)", "अपने काम की जानकारी जोड़ें (ज़रूरी नहीं)", "اپنے کام کی تفصیل شامل کریں (اختیاری)", "Magdagdag ng detalye sa trabaho (opsyonal)"],
  "suggestion.skip": ["Skip any question. Add only what you did in this job.", "يمكنك تخطي أي سؤال. أضف فقط ما فعلته في هذا العمل.", "आप कोई भी सवाल छोड़ सकते हैं। वही जोड़ें जो आपने इस काम में किया।", "کوئی بھی سوال چھوڑ سکتے ہیں۔ وہی شامل کریں جو آپ نے اس کام میں کیا۔", "Maaari mong laktawan ang anumang tanong. Idagdag lang ang ginawa mo sa trabahong ito."],
  "suggestion.detailAdded": ["Added to your job description.", "أضفنا الإجابة إلى وصف عملك.", "जवाब काम की जानकारी में जोड़ दिया।", "جواب آپ کے کام کی تفصیل میں شامل ہو گیا۔", "Naidagdag na sa paglalarawan ng trabaho mo."],
  "suggestion.detailRemoved": ["Removed that answer.", "حذفنا هذه الإجابة.", "वह जवाब हटा दिया।", "وہ جواب ہٹا دیا گیا۔", "Inalis na ang sagot na iyon."],
  "suggestion.custom": ["Or write one line", "أو اكتب سطرًا", "या एक पंक्ति लिखें", "یا ایک سطر لکھیں", "O sumulat ng isang linya"],
  "suggestion.addCustom": ["Add my line", "أضف سطري", "मेरी पंक्ति जोड़ें", "میری سطر شامل کریں", "Idagdag ang linya ko"],
} satisfies Record<string, Row>;

function pack(index: 0 | 1 | 2 | 3 | 4) {
  return Object.fromEntries(Object.entries(rows).map(([key, row]) => [key, row[index]]));
}

export const suggestionControlTranslations = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };
