"use client";

import { useState, useEffect } from "react";

const DISMISSED_KEY = "ia-email-dismissed";
const SUBSCRIBED_KEY = "ia-email-subscribed";

interface EmailCaptureProps {
  cvScore: number;
  userName: string;
}

export default function EmailCapture({ cvScore, userName }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    const wasSubscribed = localStorage.getItem(SUBSCRIBED_KEY);
    if (!wasDismissed && !wasSubscribed) {
      setDismissed(false);
    }
  }, []);

  if (dismissed || status === "success") {
    if (status === "success") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <svg
            className="w-10 h-10 text-green-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-green-800 font-semibold">You are in.</p>
          <p className="text-green-700 text-sm mt-1">
            Check your inbox for your first career tip.
          </p>
        </div>
      );
    }
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg("Enter a valid email address");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: userName.split(" ")[0] || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Could not subscribe. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  };

  const scoreLabel =
    cvScore >= 75 ? "strong" : cvScore >= 50 ? "getting there" : "needs work";

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 md:p-8 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative space-y-4">
        {/* Headline */}
        <div>
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wide">
            Your CV score: {cvScore}/100 ({scoreLabel})
          </p>
          <h3 className="text-xl md:text-2xl font-bold mt-2 leading-tight">
            Get weekly tips to raise that score
          </h3>
          <p className="text-gray-300 text-sm mt-2 leading-relaxed">
            Join 2,000+ professionals who receive one actionable career tip
            every week. Written by an HR Specialist who reviews CVs daily.
            Unsubscribe anytime.
          </p>
        </div>

        {/* What you get */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            CV improvement tips
          </span>
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            Interview strategies
          </span>
          <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            Salary negotiation
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your best email"
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
          >
            {status === "loading" ? "Joining..." : "Get Free Tips"}
          </button>
        </form>

        {errorMsg && (
          <p className="text-red-400 text-sm">{errorMsg}</p>
        )}

        {/* Trust signal */}
        <p className="text-gray-500 text-xs">
          No spam. One email per week. Unsubscribe with one click.
        </p>
      </div>
    </div>
  );
}
