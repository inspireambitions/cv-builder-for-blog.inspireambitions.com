/**
 * Gulf/GCC-specific keyword banks for CV scoring.
 * These power Layer 3 of the scoring engine.
 */

export const ACTION_VERBS = [
  "achieved", "accelerated", "administered", "built", "chaired", "consolidated",
  "coordinated", "delivered", "designed", "developed", "directed", "drove",
  "eliminated", "established", "exceeded", "executed", "expanded", "generated",
  "grew", "implemented", "improved", "increased", "introduced", "launched",
  "led", "managed", "mentored", "negotiated", "optimised", "orchestrated",
  "overhauled", "pioneered", "produced", "promoted", "reduced", "restructured",
  "revamped", "scaled", "secured", "simplified", "spearheaded", "streamlined",
  "strengthened", "supervised", "surpassed", "trained", "transformed", "tripled",
];

export const QUANTIFIER_PATTERNS = [
  /\d+%/,                    // "increased by 25%"
  /\$[\d,.]+/,               // "$1.2M revenue"
  /AED\s?[\d,.]+/i,          // "AED 500,000"
  /SAR\s?[\d,.]+/i,          // "SAR 200,000"
  /QAR\s?[\d,.]+/i,          // "QAR 100,000"
  /KWD\s?[\d,.]+/i,          // "KWD 50,000"
  /BHD\s?[\d,.]+/i,          // "BHD 30,000"
  /OMR\s?[\d,.]+/i,          // "OMR 20,000"
  /\d+\+?\s*(employees|staff|people|team members|direct reports)/i,
  /\d+\+?\s*(properties|hotels|outlets|branches|units)/i,
  /\d+\+?\s*(nationalities|countries|markets)/i,
  /\d+\+?\s*(years|months)/i,
  /budget\s+of\s+[\d,.]+/i,
  /portfolio\s+of\s+[\d,.]+/i,
  /managed\s+[\d,.]+/i,
  /reduced\s+.*?\d+%/i,
  /increased\s+.*?\d+%/i,
  /grew\s+.*?\d+%/i,
  /saved\s+.*?[\d,.]+/i,
];

export const VISA_PATTERNS = [
  /visa\s*(status|type|:)/i,
  /residence\s*visa/i,
  /employment\s*visa/i,
  /golden\s*visa/i,
  /visit\s*visa/i,
  /work\s*permit/i,
  /freely\s*transferable/i,
  /husband['']?s?\s*visa/i,
  /spouse\s*visa/i,
  /own\s*visa/i,
  /cancellable\s*visa/i,
  /noc\s*(available|provided|ready)/i,
  /no\s*objection\s*certificate/i,
];

export const NOTICE_PERIOD_PATTERNS = [
  /notice\s*period/i,
  /available\s*(immediately|from|in\s*\d)/i,
  /can\s*join\s*(immediately|within|in\s*\d)/i,
  /immediate\s*joiner/i,
  /\d+\s*(day|week|month)s?\s*notice/i,
  /currently\s*serving\s*notice/i,
];

export const DRIVING_LICENCE_PATTERNS = [
  /driv(ing|er['']?s?)\s*(licence|license)/i,
  /uae\s*(driving|driver)/i,
  /valid\s*(uae|gcc|international)\s*(driving|driver)/i,
  /own\s*(car|vehicle|transport)/i,
];

export const ARABIC_LANGUAGE_PATTERNS = [
  /arabic/i,
  /Ø¹Ø±Ø¨Ù/,
  /Ø§ÙØ¹Ø±Ø¨ÙØ©/,
];

export const GCC_CERTIFICATIONS = [
  /mohre/i,
  /khda/i,
  /haad/i,
  /dha\b/i,
  /doe\b/i,
  /adek/i,
  /rera\b/i,
  /dmcc/i,
  /difc/i,
  /adgm/i,
  /ica\b/i,
  /gdrfa/i,
  /tdra/i,
  /sira\b/i,
  /scad/i,
  /ncema/i,
  /shrm/i,
  /cipd/i,
  /cpa\b/i,
  /acca/i,
  /pmp\b/i,
  /prince2/i,
  /nebosh/i,
  /iosh/i,
  /haccp/i,
  /iso\s*\d+/i,
  /gsdc/i,
  /celta/i,
  /delta/i,
];

export const GCC_EMPLOYERS = [
  /rotana/i, /emaar/i, /adnoc/i, /aramco/i, /sabic/i,
  /etihad/i, /emirates\s*(airline|group|nbd|flight)/i,
  /du\b/i, /etisalat/i, /e&/i,
  /aldar/i, /nakheel/i, /meraas/i, /majid\s*al\s*futtaim/i,
  /al\s*futtaim/i, /chalhoub/i, /al\s*tayer/i,
  /jumeirah/i, /accor/i, /marriott/i, /hilton/i, /hyatt/i,
  /kerzner/i, /four\s*seasons/i, /mandarin\s*oriental/i,
  /adcb/i, /fab\b/i, /mashreq/i, /dib\b/i, /enbd/i,
  /damac/i, /azizi/i, /sobha/i, /danube/i,
  /tabreed/i, /dewa/i, /addc/i, /sewa/i,
  /dnata/i, /serco/i, /g42/i, /group\s*42/i,
  /mubadala/i, /adia\b/i, /adq\b/i,
  /dafza/i, /jafza/i, /saadiyat/i,
  /expo\s*(2020|city|dubai)/i,
  /neom/i, /qiddiya/i, /the\s*line/i, /amaala/i,
];

export const GULF_INDUSTRY_KEYWORDS = [
  /emiratisation/i, /saudisation/i, /saudization/i,
  /omanisation/i, /nationalisation\s*(quota|target|programme)/i,
  /wps\b/i, /wage\s*protection/i,
  /gratuity/i, /end\s*of\s*service/i,
  /free\s*zone/i, /mainland/i, /offshore/i,
  /labour\s*(law|card|camp)/i,
  /medical\s*fitness/i, /emirates\s*id/i,
  /trade\s*licence/i, /commercial\s*licence/i,
  /pro\s*(services|officer)/i,
  /gcc\s*(national|experience|market)/i,
  /mena\b/i, /gulf\s*(region|market|experience)/i,
  /middle\s*east/i,
  /multi-?cultural/i, /multi-?national/i,
  /expat(riate)?/i,
  /\d+\+?\s*nationalities/i,
];
