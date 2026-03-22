"use client";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "coverLetter" | "roast" | "annual";
  onSuccess?: () => void;
}

const FEATURE_INFO = {
  coverLetter: {
    title: "Generate Cover Letter",
    description: "AI-powered cover letter tailored to your CV and target role.",
  },
  roast: {
    title: "AI CV Roast",
    description: "Brutally honest HR Director feedback on your CV. No sugar-coating.",
  },
  annual: {
    title: "Annual Plan",
    description:
      "Unlimited PDF/Word exports, Cover Letter, Mock Interview, 12 AI Roast credits, Priority Support.",
  },
};

export default function PaymentModal({
  isOpen,
  onClose,
  feature,
  onSuccess,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const info = FEATURE_INFO[feature];

  function handleAccess() {
    if (onSuccess) onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          \u2715
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{info.description}</p>

        <div className="bg-green-50 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">Launch period</span>
          <span className="text-2xl font-bold text-green-600">FREE</span>
        </div>

        <button
          onClick={handleAccess}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Access for Free
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          All features are free during our launch period. Premium plans coming soon.
        </p>
      </div>
    </div>
  );
}
