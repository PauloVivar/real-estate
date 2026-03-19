"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        copied
          ? "bg-green-500 text-white"
          : "bg-primary-500 text-white hover:bg-primary-600"
      }`}
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}
