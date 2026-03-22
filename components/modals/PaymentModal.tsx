"use client";

import { useState } from "react";

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
    price: "$2",
    priceType: "cover-letter",
  },
  roast: {
    title: "AI CV Roast",
    description: "Brutally honest HR Director feedback on your CV. No sugar-coating.",
    price: "$2",
    priceType: "roast",
  },
  annual: {
    title: "Annual Plan",
    description:
      "Unlimited PDF/Word exports, Cover Letter, Mock Interview, 12 AI Roast credits, Priority Support.",
    price: "$86.40/year",
    priceType: "annual",
  },
};

export default function PaymentModal({
  isOpen,
  onClose,
  feature,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const info = FEATURE_INFO[feature];

  async function handlePayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType: info.priceType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not create payment session. Please try again.");
      }
    } catch {
      setError("Payment service unavailable. Please try again later.");
    }
    setLoading(false);
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
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{info.description}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">One-time payment</span>
          <span className="text-2xl font-bold text-gray-900">{info.price}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? "Redirecting to Stripe..." : `Pay ${info.price} with Stripe`}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure payment via Stripe. No data stored on our servers.
        </p>

        {feature !== "annual" && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Or get everything with the{" "}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/stripe-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ priceType: "annual" }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    /* ignore */
                  }
                }}
                className="text-gold-600 font-medium hover:underline"
              >
                Annual Plan ($86.40/yr)
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
