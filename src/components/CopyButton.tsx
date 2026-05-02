'use client';

import { useState } from 'react';

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-4 flex-shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
    >
      {copied ? '¡Copiado!' : 'Copiar'}
    </button>
  );
}
