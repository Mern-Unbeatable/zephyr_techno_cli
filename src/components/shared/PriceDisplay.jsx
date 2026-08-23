import React from 'react';

export function formatGbp(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function savingPercent(price, compareAtPrice) {
  const current = Number(price);
  const retail = Number(compareAtPrice);
  if (!retail || !current || retail <= current) return null;
  return Math.max(1, Math.round(((retail - current) / retail) * 100));
}

export default function PriceDisplay({
  price,
  compareAtPrice,
  size = 'md',
}) {
  const save = savingPercent(price, compareAtPrice);
  const showRetail = Number(compareAtPrice) > Number(price);

  const sellClass =
    size === 'xl'
      ? 'text-2xl md:text-3xl lg:text-4xl'
      : size === 'lg'
        ? 'text-xl md:text-2xl'
        : 'text-lg md:text-xl';

  const retailClass =
    size === 'xl' ? 'text-base md:text-lg' : 'text-xs md:text-sm';

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className={`${sellClass} font-bold tracking-tight text-custom`}>
          £{formatGbp(price)}
        </span>
        {showRetail ? (
          <span className={`${retailClass} text-gray-400 line-through`}>
            £{formatGbp(compareAtPrice)}
          </span>
        ) : null}
      </div>
      {save ? (
        <span className="inline-flex items-center rounded-md bg-custom px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          Save {save}%
        </span>
      ) : null}
    </div>
  );
}
