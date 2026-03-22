"use client";

import { useState, useEffect, useRef } from "react";

export default function SaveToast() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleSaved() {
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 2000);
    }

    window.addEventListener("cv-saved", handleSaved);
    return () => {
      window.removeEventListener("cv-saved", handleSaved);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      &#10003; Progress saved
    </div>
  );
}
