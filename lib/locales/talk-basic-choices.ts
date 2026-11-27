// Talk Mode's English values are saved to the CV. These rows change display labels only.
// Columns: English, Arabic, Hindi, Urdu and Tagalog.
const rows: Record<string, readonly [string, string, string, string, string]> = {
  "talk.choice.city.dubai": ["Dubai, UAE", "دبي، الإمارات", "दुबई, यूएई", "دبئی، متحدہ عرب امارات", "Dubai, UAE"],
  "talk.choice.city.abuDhabi": ["Abu Dhabi, UAE", "أبوظبي، الإمارات", "अबू धाबी, यूएई", "ابو ظبی، متحدہ عرب امارات", "Abu Dhabi, UAE"],
  "talk.choice.city.doha": ["Doha, Qatar", "الدوحة، قطر", "दोहा, क़तर", "دوحہ، قطر", "Doha, Qatar"],
  "talk.choice.city.riyadh": ["Riyadh, Saudi Arabia", "الرياض، السعودية", "रियाद, सऊदी अरब", "ریاض، سعودی عرب", "Riyadh, Saudi Arabia"],
  "talk.choice.city.muscat": ["Muscat, Oman", "مسقط، عُمان", "मस्कट, ओमान", "مسقط، عمان", "Muscat, Oman"],
  "talk.choice.city.manama": ["Manama, Bahrain", "المنامة، البحرين", "मनामा, बहरीन", "منامہ، بحرین", "Manama, Bahrain"],
  "talk.choice.city.kuwait": ["Kuwait City, Kuwait", "مدينة الكويت، الكويت", "कुवैत सिटी, कुवैत", "کویت سٹی، کویت", "Kuwait City, Kuwait"],
  "talk.choice.school.none": ["No formal school", "لم ألتحق بمدرسة", "औपचारिक स्कूली शिक्षा नहीं", "باقاعدہ اسکول کی تعلیم نہیں", "Hindi nag-aral sa paaralan"],
  "talk.choice.school.primary": ["Primary school", "المرحلة الابتدائية", "प्राथमिक विद्यालय", "پرائمری اسکول", "Mababang paaralan"],
  "talk.choice.school.secondary": ["Secondary school", "المرحلة المتوسطة", "माध्यमिक विद्यालय", "ثانوی اسکول", "Junior high school"],
  "talk.choice.school.high": ["High school", "المرحلة الثانوية", "उच्च माध्यमिक विद्यालय", "اعلیٰ ثانوی اسکول", "Senior high school"],
  "talk.choice.school.diploma": ["Diploma or certificate", "دبلوم أو شهادة", "डिप्लोमा या प्रमाणपत्र", "ڈپلومہ یا سرٹیفکیٹ", "Diploma o sertipiko"],
  "talk.choice.school.university": ["University", "الجامعة", "विश्वविद्यालय", "یونیورسٹی", "Unibersidad"],
  "talk.choice.school.other": ["Other", "أخرى", "अन्य", "دیگر", "Iba pa"],
  "talk.choice.skill.team": ["Teamwork", "العمل ضمن فريق", "टीम में काम करना", "ٹیم کے ساتھ کام کرنا", "Pakikipagtulungan"],
  "talk.choice.skill.time": ["Time keeping", "الالتزام بالمواعيد", "समय की पाबंदी", "وقت کی پابندی", "Pagiging nasa oras"],
  "talk.choice.skill.safety": ["Safety checks", "فحوص السلامة", "सुरक्षा की जाँच", "حفاظت کی جانچ", "Pagsusuri ng kaligtasan"],
  "talk.choice.skill.service": ["Customer service", "خدمة العملاء", "ग्राहकों की सेवा", "گاہکوں کی خدمت", "Pag-asikaso sa mga customer"],
  "talk.choice.lang.english": ["English", "الإنجليزية", "अंग्रेज़ी", "انگریزی", "Ingles"],
  "talk.choice.lang.arabic": ["Arabic", "العربية", "अरबी", "عربی", "Arabe"],
  "talk.choice.lang.hindi": ["Hindi", "الهندية", "हिंदी", "ہندی", "Hindi"],
  "talk.choice.lang.urdu": ["Urdu", "الأردية", "उर्दू", "اردو", "Urdu"],
  "talk.choice.lang.tagalog": ["Tagalog", "التاغالوغ", "टागालोग", "ٹیگالوگ", "Tagalog"],
  "talk.choice.level.basic": ["Basic", "أساسي", "बुनियादी", "بنیادی", "Pangunahing kaalaman"],
  "talk.choice.level.good": ["Good", "جيد", "अच्छा", "اچھی", "Mahusay"],
  "talk.choice.level.veryGood": ["Very good", "جيد جدًا", "बहुत अच्छा", "بہت اچھی", "Napakahusay"],
  "talk.choice.level.native": ["Native", "اللغة الأم", "मातृभाषा", "مادری زبان", "Unang wika"],
  "talk.choice.visa.employment": ["Employment", "تأشيرة عمل", "रोज़गार वीज़ा", "ملازمت کا ویزا", "Visa sa trabaho"],
  "talk.choice.visa.visit": ["Visit", "تأشيرة زيارة", "विज़िट वीज़ा", "وزٹ ویزا", "Visit visa"],
  "talk.choice.visa.golden": ["Golden", "الإقامة الذهبية", "गोल्डन वीज़ा", "گولڈن ویزا", "Golden visa"],
  "talk.choice.visa.investor": ["Investor", "تأشيرة مستثمر", "निवेशक वीज़ा", "سرمایہ کار کا ویزا", "Investor visa"],
  "talk.choice.visa.cancelled": ["Cancelled", "التأشيرة ملغاة", "वीज़ा रद्द हो गया", "ویزا منسوخ ہے", "Kanselado ang visa"],
  "talk.choice.visa.outside": ["Outside UAE", "خارج الإمارات", "यूएई से बाहर", "متحدہ عرب امارات سے باہر", "Nasa labas ng UAE"],
  "talk.choice.visa.private": ["Prefer not to say", "أفضّل عدم الإفصاح", "बताना नहीं चाहते", "بتانا نہیں چاہتے", "Mas gusto kong hindi sabihin"],
  "talk.choice.notice.now": ["Now", "الآن", "अभी", "ابھی", "Ngayon"],
  "talk.choice.notice.week": ["1 week", "أسبوع واحد", "1 हफ़्ता", "1 ہفتہ", "1 linggo"],
  "talk.choice.notice.month": ["1 month", "شهر واحد", "1 महीना", "1 مہینہ", "1 buwan"],
  "talk.choice.notice.long": ["2 months or more", "شهران أو أكثر", "2 महीने या ज़्यादा", "2 مہینے یا زیادہ", "2 buwan o higit pa"],
  "talk.choice.letter.yes": ["Yes", "نعم", "हाँ", "ہاں", "Oo"],
  "talk.choice.letter.no": ["No", "لا", "नहीं", "نہیں", "Hindi"],
  "talk.choice.letter.na": ["Not applicable", "لا ينطبق", "लागू नहीं", "لاگو نہیں", "Hindi naaangkop"],
};

function pack(index: number): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]]));
}

export const talkBasicChoices = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };

const choiceKeys = new Map(Object.entries(talkBasicChoices.en).map(([key, english]) => [english, key]));

export function talkBasicChoiceKey(english: string): string | undefined {
  return choiceKeys.get(english);
}
