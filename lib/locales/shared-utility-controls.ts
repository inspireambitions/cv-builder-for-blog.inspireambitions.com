// English, Arabic, Hindi, Urdu and Tagalog. Native review of non-English copy is pending.
const rows: Record<string, readonly [string, string, string, string, string]> = {
  "sharedUi.themeLight": ["Switch to light mode", "التبديل إلى الوضع الفاتح", "लाइट मोड चालू करें", "روشن موڈ پر جائیں", "Lumipat sa light mode"],
  "sharedUi.themeDark": ["Switch to dark mode", "التبديل إلى الوضع الداكن", "डार्क मोड चालू करें", "گہرے موڈ پر جائیں", "Lumipat sa dark mode"],
  "sharedUi.usageLabel": ["Help improve this free tool", "ساعدنا في تحسين هذه الأداة المجانية", "इस मुफ़्त टूल को बेहतर बनाने में मदद करें", "اس مفت ٹول کو بہتر بنانے میں مدد کریں", "Tumulong na pagandahin ang libreng tool na ito"],
  "sharedUi.usageHelp": ["Share usage counts, not your CV or contact details.", "شارك إحصاءات الاستخدام فقط، وليس سيرتك الذاتية أو بيانات التواصل.", "इस्तेमाल के आँकड़े साझा करें, अपना सीवी या संपर्क जानकारी नहीं।", "صرف استعمال کی گنتی شیئر کریں، اپنا سی وی یا رابطے کی تفصیلات نہیں۔", "Ibahagi ang bilang ng paggamit, hindi ang CV o mga detalye ng contact mo."],
  "photo.title": ["Professional photo", "صورة مهنية", "पेशेवर फ़ोटो", "پیشہ ورانہ تصویر", "Propesyonal na larawan"],
  "photo.intro": ["Choose whether this CV should show your photo.", "اختر ما إذا كنت تريد إظهار صورتك في السيرة الذاتية.", "चुनें कि इस सीवी में आपकी फ़ोटो दिखे या नहीं।", "چنیں کہ اس سی وی میں آپ کی تصویر دکھائی جائے یا نہیں۔", "Piliin kung gusto mong ipakita ang larawan mo sa CV."],
  "photo.include": ["Include a photo", "إضافة صورة", "फ़ोटो शामिल करें", "تصویر شامل کریں", "Maglagay ng larawan"],
  "photo.exclude": ["Use a photo-free CV", "استخدام سيرة ذاتية بلا صورة", "बिना फ़ोटो का सीवी रखें", "تصویر کے بغیر سی وی رکھیں", "Gumamit ng CV na walang larawan"],
  "photo.noPhotoAdvice": ["Photo-free CVs are often preferred by multinational employers and for applications outside the GCC.", "غالبًا ما تفضّل الشركات متعددة الجنسيات وطلبات التوظيف خارج دول الخليج سيرةً ذاتية بلا صورة.", "बहुराष्ट्रीय कंपनियाँ और खाड़ी देशों से बाहर के नियोक्ता अक्सर बिना फ़ोटो वाला सीवी पसंद करते हैं।", "ملٹی نیشنل کمپنیاں اور خلیجی ممالک سے باہر کے آجر اکثر تصویر کے بغیر سی وی پسند کرتے ہیں۔", "Kadalasang mas gusto ng mga multinational na kumpanya at ng mga employer sa labas ng GCC ang CV na walang larawan."],
  "photo.hidden": ["The {template} template hides photos. Your image will stay saved, but it will not appear until you choose a photo-enabled design.", "يخفي قالب {template} الصور. ستبقى صورتك محفوظة، ولن تظهر إلا إذا اخترت تصميمًا يعرض الصور.", "{template} टेम्पलेट फ़ोटो छिपाता है। आपकी फ़ोटो सहेजी रहेगी। वह तभी दिखेगी जब आप फ़ोटो वाला डिज़ाइन चुनेंगे।", "{template} ٹیمپلیٹ تصویریں چھپاتا ہے۔ آپ کی تصویر محفوظ رہے گی اور تب دکھے گی جب آپ تصویر والا ڈیزائن چنیں گے۔", "Tinatago ng template na {template} ang mga larawan. Mananatiling naka-save ang larawan mo at lalabas lang ito kapag pumili ka ng disenyong may larawan."],
  "photo.currentAlt": ["Current professional photo", "الصورة المهنية الحالية", "मौजूदा पेशेवर फ़ोटो", "موجودہ پیشہ ورانہ تصویر", "Kasalukuyang propesyonal na larawan"],
  "photo.preparing": ["Preparing...", "جارٍ تجهيز الصورة…", "फ़ोटो तैयार हो रही है…", "تصویر تیار ہو رہی ہے…", "Inihahanda…"],
  "photo.upload": ["Upload photo", "رفع صورة", "फ़ोटो अपलोड करें", "تصویر اپ لوڈ کریں", "Mag-upload ng larawan"],
  "photo.replace": ["Replace photo", "استبدال الصورة", "फ़ोटो बदलें", "تصویر بدلیں", "Palitan ang larawan"],
  "photo.choose": ["Choose photo", "اختيار صورة", "फ़ोटो चुनें", "تصویر چنیں", "Pumili ng larawan"],
  "photo.remove": ["Remove photo", "إزالة الصورة", "फ़ोटो हटाएँ", "تصویر ہٹائیں", "Alisin ang larawan"],
  "photo.uploadHelp": ["JPG, PNG, WEBP, HEIC or HEIF. Maximum 5 MB. EXIF metadata is removed.", "JPG أو PNG أو WEBP أو HEIC أو HEIF. الحد الأقصى 5 ميغابايت. نحذف بيانات EXIF من الصورة.", "JPG, PNG, WEBP, HEIC या HEIF। अधिकतम 5 MB। हम फ़ोटो से EXIF डेटा हटाते हैं।", "JPG، PNG، WEBP، HEIC یا HEIF۔ زیادہ سے زیادہ 5 MB۔ ہم تصویر سے EXIF ڈیٹا ہٹا دیتے ہیں۔", "JPG, PNG, WEBP, HEIC o HEIF. Hanggang 5 MB. Inaalis namin ang EXIF na data mula sa larawan."],
  "photo.cropPreview": ["Photo crop preview", "معاينة اقتصاص الصورة", "काटी जाने वाली फ़ोटो की झलक", "تصویر کی تراش کا پیش منظر", "Preview ng pag-crop ng larawan"],
  "photo.pendingAlt": ["Photo awaiting crop", "الصورة قبل الاقتصاص", "काटने से पहले की फ़ोटो", "تراشنے سے پہلے کی تصویر", "Larawang kailangan pang i-crop"],
  "photo.cropGuide": ["Keep your head and shoulders inside the guide.", "أبقِ رأسك وكتفيك داخل الإطار الإرشادي.", "अपना सिर और कंधे गाइड के अंदर रखें।", "اپنا سر اور کندھے گائیڈ کے اندر رکھیں۔", "Panatilihin ang ulo at balikat sa loob ng gabay."],
  "photo.cropX": ["Move left or right", "تحريك يمينًا أو يسارًا", "बाएँ या दाएँ करें", "بائیں یا دائیں کریں", "Ilipat sa kaliwa o kanan"],
  "photo.cropY": ["Move up or down", "تحريك لأعلى أو لأسفل", "ऊपर या नीचे करें", "اوپر یا نیچے کریں", "Ilipat pataas o pababa"],
  "photo.zoom": ["Zoom", "التكبير", "ज़ूम", "زوم", "Zoom"],
  "photo.saving": ["Saving...", "جارٍ الحفظ…", "सहेजा जा रहा है…", "محفوظ ہو رہا ہے…", "Sine-save…"],
  "photo.save": ["Save crop", "حفظ الصورة بعد الاقتصاص", "काटी हुई फ़ोटो सहेजें", "تراشی ہوئی تصویر محفوظ کریں", "I-save ang na-crop na larawan"],
  "photo.cancel": ["Cancel", "إلغاء", "रद्द करें", "منسوخ کریں", "Kanselahin"],
  "photo.qualityGroup": ["Photo quality checks", "فحوص جودة الصورة", "फ़ोटो की गुणवत्ता की जाँचें", "تصویر کے معیار کی جانچیں", "Mga pagsusuri sa kalidad ng larawan"],
  "photo.qualityTitle": ["Photo quality check", "فحص جودة الصورة", "फ़ोटो की गुणवत्ता की जाँच", "تصویر کے معیار کی جانچ", "Pagsusuri sa kalidad ng larawan"],
  "photo.status.pass": ["Pass", "جيد", "ठीक", "ٹھیک", "Pumasa"],
  "photo.status.warning": ["Review", "راجع", "जाँचें", "دوبارہ دیکھیں", "Suriin"],
  "photo.status.advice": ["Guide", "إرشاد", "सुझाव", "مشورہ", "Gabay"],
  "photo.label.face": ["Face position", "موضع الوجه", "चेहरे की जगह", "چہرے کی جگہ", "Posisyon ng mukha"],
  "photo.label.resolution": ["Resolution", "دقة الصورة", "रिज़ॉल्यूशन", "ریزولوشن", "Resolusyon"],
  "photo.label.compression": ["File quality", "جودة الملف", "फ़ाइल की गुणवत्ता", "فائل کا معیار", "Kalidad ng file"],
  "photo.label.lighting": ["Lighting", "الإضاءة", "रोशनी", "روشنی", "Ilaw"],
  "photo.label.sharpness": ["Sharpness", "وضوح الصورة", "फ़ोटो की स्पष्टता", "تصویر کی وضاحت", "Linaw"],
  "photo.check.faceGuide": ["Use the crop guide to keep your face centred with limited empty background.", "استخدم إطار الاقتصاص لتوسيط وجهك وتقليل الفراغ في الخلفية.", "चेहरा बीच में रखें और गाइड से खाली पृष्ठभूमि कम करें।", "تراش کی گائیڈ سے چہرہ بیچ میں رکھیں اور پس منظر کا خالی حصہ کم کریں۔", "Gamitin ang crop guide para nasa gitna ang mukha mo at kaunti lang ang espasyo sa likod."],
  "photo.check.noFace": ["No clear face was detected.", "لم يظهر وجه واضح في الصورة.", "फ़ोटो में कोई साफ़ चेहरा नहीं दिखा।", "تصویر میں کوئی چہرہ واضح نظر نہیں آیا۔", "Walang nakitang malinaw na mukha."],
  "photo.check.onlyYou": ["Use a photo showing only you.", "اختر صورة لا يظهر فيها أحد سواك.", "ऐसी फ़ोटो चुनें जिसमें सिर्फ़ आप हों।", "ایسی تصویر چنیں جس میں صرف آپ ہوں۔", "Pumili ng larawang ikaw lang ang nasa frame."],
  "photo.check.moveCloser": ["Move closer or crop excess background.", "اقترب أو اقتصّ الخلفية الزائدة.", "पास आएँ या फ़ोटो से खाली पृष्ठभूमि काटें।", "قریب آئیں یا تصویر کا اضافی پس منظر تراش دیں۔", "Lumapit o i-crop ang sobrang background."],
  "photo.check.centreFace": ["Move the crop so your face sits near the centre.", "حرّك إطار الاقتصاص ليكون وجهك قرب الوسط.", "कटाई समायोजित करें ताकि चेहरा बीच के पास रहे।", "تراش کو بدلیں تاکہ چہرہ درمیان کے قریب ہو۔", "Ayusin ang crop para malapit sa gitna ang mukha mo."],
  "photo.check.facePass": ["One clear, centred face detected.", "ظهر وجه واحد واضح في وسط الصورة.", "बीच में एक साफ़ चेहरा दिखा।", "درمیان میں ایک واضح چہرہ نظر آیا۔", "Isang malinaw na mukha ang nakita sa gitna."],
  "photo.check.faceFallback": ["Check the crop guide and keep your face near the centre.", "راجع إطار الاقتصاص وأبقِ وجهك قرب الوسط.", "गाइड देखें और चेहरा बीच के पास रखें।", "تراش کی گائیڈ دیکھیں اور چہرہ درمیان کے قریب رکھیں۔", "Tingnan ang crop guide at panatilihing malapit sa gitna ang mukha mo."],
  "photo.check.resolutionPass": ["{size} pixels.", "{size} بكسل.", "{size} पिक्सेल।", "{size} پکسل۔", "{size} pixel."],
  "photo.check.resolutionWarning": ["Use an image at least 600 pixels on its shortest side.", "اختر صورة لا يقل طول ضلعها الأقصر عن 600 بكسل.", "ऐसी फ़ोटो लें जिसकी छोटी भुजा कम से कम 600 पिक्सेल की हो।", "ایسی تصویر چنیں جس کا چھوٹا رخ کم از کم 600 پکسل ہو۔", "Gumamit ng larawang may 600 pixel o higit pa sa pinakamaikling gilid."],
  "photo.check.compressionPass": ["The image has enough detail for a CV.", "تفاصيل الصورة واضحة بما يكفي للسيرة الذاتية.", "इस फ़ोटो में सीवी के लिए पर्याप्त बारीकियाँ हैं।", "تصویر میں سی وی کے لیے کافی تفصیل ہے۔", "Sapat ang detalye ng larawan para sa CV."],
  "photo.check.compressionWarning": ["This file may be heavily compressed. Use the original photo if possible.", "ربما ضُغط الملف كثيرًا. استخدم الصورة الأصلية إن أمكن.", "यह फ़ाइल काफ़ी दबाई गई हो सकती है। हो सके तो मूल फ़ोटो चुनें।", "فائل شاید بہت زیادہ کمپریس ہوئی ہے۔ اگر ہو سکے تو اصل تصویر چنیں۔", "Baka sobrang na-compress ang file. Kung maaari, gamitin ang orihinal na larawan."],
  "photo.check.lightingPass": ["Lighting is within a useful range.", "الإضاءة مناسبة.", "रोशनी ठीक है।", "روشنی مناسب ہے۔", "Sapat ang ilaw."],
  "photo.check.dark": ["The photo looks dark.", "تبدو الصورة معتمة.", "फ़ोटो गहरी दिख रही है।", "تصویر تاریک لگ رہی ہے۔", "Mukhang madilim ang larawan."],
  "photo.check.bright": ["The photo looks overexposed or has harsh lighting.", "تبدو الصورة ساطعة جدًا أو إضاءتها حادة.", "फ़ोटो में रोशनी बहुत तेज़ दिखती है।", "تصویر میں روشنی بہت تیز لگ رہی ہے۔", "Mukhang sobrang liwanag ng larawan o matapang ang ilaw."],
  "photo.check.sharpnessPass": ["The image looks reasonably sharp.", "تبدو الصورة واضحة.", "फ़ोटो काफ़ी साफ़ दिखती है।", "تصویر کافی واضح لگتی ہے۔", "Mukhang malinaw ang larawan."],
  "photo.check.sharpnessWarning": ["The photo may be blurred. Use a sharper original.", "قد تكون الصورة ضبابية. استخدم صورة أصلية أوضح.", "फ़ोटो धुँधली हो सकती है। कोई साफ़ मूल फ़ोटो लें।", "تصویر دھندلی ہو سکتی ہے۔ کوئی واضح اصل تصویر چنیں۔", "Baka malabo ang larawan. Gumamit ng mas malinaw na orihinal."],
  "photo.check.generic": ["Review your photo before you save it.", "راجع صورتك قبل حفظها.", "सहेजने से पहले अपनी फ़ोटो जाँचें।", "محفوظ کرنے سے پہلے اپنی تصویر دیکھیں۔", "Suriin ang larawan bago i-save."],
  "photo.portraitAdvice": ["Use a recent head-and-shoulders portrait. Choose a plain background and professional clothing. Avoid filters and passport scans.", "استخدم صورة حديثة للرأس والكتفين. اختر خلفية بسيطة وملابس مهنية. تجنّب الفلاتر ونسخ جواز السفر.", "सिर और कंधों की हाल की फ़ोटो लगाएँ। सादी पृष्ठभूमि और पेशेवर कपड़े चुनें। फ़िल्टर और पासपोर्ट स्कैन न लगाएँ।", "سر اور کندھوں کی حالیہ تصویر لگائیں۔ سادہ پس منظر اور پیشہ ورانہ لباس چنیں۔ فلٹر اور پاسپورٹ اسکین نہ لگائیں۔", "Gumamit ng bagong larawan na kita ang ulo at balikat. Pumili ng simpleng background at disenteng damit. Iwasan ang filter at scan ng passport."],
  "photo.chooseFile": ["Choose professional photo file", "اختيار ملف الصورة المهنية", "पेशेवर फ़ोटो की फ़ाइल चुनें", "پیشہ ورانہ تصویر کی فائل چنیں", "Pumili ng file para sa propesyonal na larawan"],
  "photo.error.supported": ["Choose a supported image.", "اختر صورة بتنسيق مدعوم.", "मान्य फ़ॉर्मैट की फ़ोटो चुनें।", "درست فارمیٹ کی تصویر چنیں۔", "Pumili ng larawang nasa suportadong format."],
  "photo.error.size": ["Image must be under 5MB", "يجب أن يقل حجم الصورة عن 5 ميغابايت", "फ़ोटो 5 MB से कम होनी चाहिए", "تصویر 5 MB سے کم ہونی چاہیے", "Dapat mas maliit sa 5 MB ang larawan"],
  "photo.error.serverSize": ["Image must be under 5MB.", "يجب أن يقل حجم الصورة عن 5 ميغابايت.", "फ़ोटो 5 MB से कम होनी चाहिए।", "تصویر 5 MB سے کم ہونی چاہیے۔", "Dapat mas maliit sa 5 MB ang larawan."],
  "photo.error.type": ["Please upload a JPG, PNG, WEBP, HEIC, or HEIF image", "ارفع صورة بصيغة JPG أو PNG أو WEBP أو HEIC أو HEIF", "JPG, PNG, WEBP, HEIC या HEIF फ़ोटो अपलोड करें", "JPG، PNG، WEBP، HEIC یا HEIF تصویر اپ لوڈ کریں", "Mag-upload ng JPG, PNG, WEBP, HEIC o HEIF na larawan"],
  "photo.error.serverType": ["Please upload JPG, PNG, WEBP, HEIC, or HEIF.", "ارفع صورة بصيغة JPG أو PNG أو WEBP أو HEIC أو HEIF.", "JPG, PNG, WEBP, HEIC या HEIF फ़ोटो अपलोड करें।", "JPG، PNG، WEBP، HEIC یا HEIF تصویر اپ لوڈ کریں۔", "Mag-upload ng larawang JPG, PNG, WEBP, HEIC o HEIF."],
  "photo.error.missing": ["Missing image file.", "لم يصل ملف الصورة.", "फ़ोटो की फ़ाइल नहीं मिली।", "تصویر کی فائل نہیں ملی۔", "Walang file ng larawan."],
  "photo.error.process": ["We could not process this image. Try JPG or PNG if HEIC fails.", "تعذّرت معالجة الصورة. جرّب JPG أو PNG إذا لم يعمل HEIC.", "हम इस फ़ोटो को तैयार नहीं कर सके। HEIC न चले तो JPG या PNG आज़माएँ।", "ہم تصویر تیار نہیں کر سکے۔ اگر HEIC نہ چلے تو JPG یا PNG آزمائیں۔", "Hindi namin maihanda ang larawan. Subukan ang JPG o PNG kung hindi gumana ang HEIC."],
  "photo.error.prepare": ["The photo could not be prepared.", "تعذّر تجهيز الصورة.", "फ़ोटो तैयार नहीं हो सकी।", "تصویر تیار نہیں ہو سکی۔", "Hindi maihanda ang larawan."],
  "photo.error.preview": ["The photo preview could not be read.", "تعذّر فتح معاينة الصورة.", "फ़ोटो की झलक नहीं खुल सकी।", "تصویر کا پیش منظر نہیں کھل سکا۔", "Hindi mabuksan ang preview ng larawan."],
  "photo.error.cropUnavailable": ["The crop tool is unavailable in this browser.", "أداة الاقتصاص غير متاحة في هذا المتصفح.", "इस ब्राउज़र में फ़ोटो काटने की सुविधा नहीं है।", "اس براؤزر میں تصویر تراشنے کی سہولت نہیں ہے۔", "Hindi available ang crop tool sa browser na ito."],
  "photo.error.crop": ["The crop could not be saved.", "تعذّر حفظ الصورة بعد الاقتصاص.", "काटी हुई फ़ोटो सहेजी नहीं जा सकी।", "تراشی ہوئی تصویر محفوظ نہیں ہو سکی۔", "Hindi ma-save ang na-crop na larawan."],
};

function pack(index: number): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]]));
}

export const sharedUtilityControlTranslations = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };

// The photo API and the local quality helper currently return prose, not codes.
// Match their known messages at the UI boundary and keep technical errors out of the interface.
const photoMessageKeys = new Map(Object.entries(sharedUtilityControlTranslations.en)
  .filter(([key]) => key.startsWith("photo.error.") || key.startsWith("photo.check."))
  .map(([key, value]) => [value, key]));

export function photoMessageKey(message: string | undefined, fallback: string): string {
  return message ? photoMessageKeys.get(message) ?? fallback : fallback;
}
