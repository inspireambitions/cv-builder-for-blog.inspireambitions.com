// Machine-translated first pass. Native-speaker review remains pending.
// These labels never replace candidate-entered answers.
const rows: Record<string, readonly [string, string, string, string, string]> = {
  "talk.profileFacts": ["Your CV profile comes from the details you entered.", "تُبنى نبذة سيرتك الذاتية من المعلومات التي أدخلتها.", "आपके सीवी का परिचय आपकी दी हुई जानकारी से बनता है।", "سی وی میں آپ کا تعارف آپ کی دی ہوئی معلومات سے بنتا ہے۔", "Galing sa mga detalyeng inilagay mo ang buod sa CV."],
  "talk.profileAbout": ["About you", "نبذة عنك", "आपके बारे में", "آپ کے بارے میں", "Tungkol sa iyo"],
  "talk.profileUpdate": ["To update it, change your work, skills or languages.", "لتعديل النبذة، غيّر خبرتك أو مهاراتك أو لغاتك.", "बदलने के लिए काम, कौशल या भाषाओं की जानकारी बदलें।", "بدلنے کے لیے کام، مہارتوں یا زبانوں کی معلومات بدلیں۔", "Para baguhin ito, ayusin ang trabaho, kasanayan o mga wika mo."],
  "talk.profileKeep": ["Keep these words", "احتفظ بهذه الصياغة", "ये शब्द रखें", "یہ الفاظ رکھیں", "Gamitin ang buod na ito"],
  "talk.trueLines": ["Choose only lines that are true for you.", "اختر فقط الجمل التي تنطبق عليك.", "केवल अपने लिए सच वाक्य चुनें।", "صرف اپنے لیے سچے جملے چنیں۔", "Piliin lang ang mga pangungusap na totoo para sa iyo."],
  "talk.ownWords": ["Say it in my words", "اكتب بكلماتك", "अपने शब्दों में लिखें", "اپنے الفاظ میں لکھیں", "Isulat sa sarili kong salita"],
  "talk.linesSaved": ["Your lines save as you type. Check suggested lines before adding.", "تُحفظ الجمل أثناء الكتابة. راجع الاقتراحات قبل إضافتها.", "लिखते समय वाक्य सहेजे जाते हैं। सुझाव जोड़ने से पहले जाँचें।", "لکھتے وقت جملے محفوظ ہوتے ہیں۔ تجاویز شامل کرنے سے پہلے دیکھیں۔", "Naka-save habang nagsusulat ka. Suriin ang mga mungkahi bago idagdag."],
  "talk.helpLines": ["Help me write these lines", "ساعدني في صياغة هذه الجمل", "ये वाक्य लिखने में मदद करें", "یہ جملے لکھنے میں مدد کریں", "Tulungan akong isulat ito"],
  "talk.changeLine": ["Change this line", "عدّل هذه الجملة", "यह वाक्य बदलें", "یہ جملہ بدلیں", "Baguhin ang pangungusap"],
  "talk.added": ["Added to your CV", "أُضيفت إلى سيرتك الذاتية", "सीवी में जोड़ दिया", "سی وی میں شامل کر دیا", "Nailagay sa CV mo"],
  "talk.keep": ["Keep", "احتفظ", "रखें", "رکھیں", "Panatilihin"],
  "talk.change": ["Change", "عدّل", "बदलें", "بدلیں", "Baguhin"],
  "talk.yes": ["Yes", "نعم", "हाँ", "ہاں", "Oo"],
  "talk.no": ["No", "لا", "नहीं", "نہیں", "Hindi"],
  "talk.addJob": ["Yes, add a job", "نعم، أضف وظيفة", "हाँ, नौकरी जोड़ें", "ہاں، ملازمت شامل کریں", "Oo, magdagdag ng trabaho"],
  "talk.noNext": ["No, next", "لا، تابع", "नहीं, आगे बढ़ें", "نہیں، آگے بڑھیں", "Hindi, magpatuloy"],
  "talk.writing": ["Writing suggestions. You can keep using your own words.", "نكتب اقتراحات. يمكنك مواصلة الكتابة بكلماتك.", "सुझाव लिख रहे हैं। आप अपने शब्दों में लिख सकते हैं।", "تجاویز لکھ رہے ہیں۔ آپ اپنے الفاظ میں لکھ سکتے ہیں۔", "Gumagawa ng mungkahi. Maaari ka pa ring gumamit ng sarili mong salita."],
};
function pack(index: number): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]]));
}
export const talkControlTranslations = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };
