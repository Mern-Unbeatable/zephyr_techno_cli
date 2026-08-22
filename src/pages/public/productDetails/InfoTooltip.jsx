import React, { useState } from 'react';

export default function InfoTooltip({ label, text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1.5 text-sm text-[#64748B]">
      <span>{label}</span>
      <button
        type="button"
        aria-label={text}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#94A3B8] text-[10px] font-semibold leading-none text-[#64748B] hover:border-[#151A2A] hover:text-[#151A2A]"
      >
        i
      </button>
      {open ? (
        <span className="absolute left-0 top-6 z-30 w-64 rounded-lg bg-[#1F2937] px-3 py-2 text-left text-xs leading-relaxed text-white shadow-lg">
          {text}
        </span>
      ) : null}
    </span>
  );
}
