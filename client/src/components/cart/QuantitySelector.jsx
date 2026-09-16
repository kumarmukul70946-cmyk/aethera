import React from "react";

/**
 * Reusable Quantity Selector component — Warm-light Japandi style.
 */
export default function QuantitySelector({
  quantity = 1,
  maxStock = 99,
  onChange,
  disabled = false
}) {
  const handleDecrement = () => {
    if (quantity > 1 && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock && !disabled) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-200 p-1 shadow-xs">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1 || disabled}
        className="w-7 h-7 rounded-full bg-white text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 transition flex items-center justify-center text-xs font-bold shadow-xs"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-8 text-center text-xs font-bold text-neutral-900">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxStock || disabled}
        className="w-7 h-7 rounded-full bg-white text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 transition flex items-center justify-center text-xs font-bold shadow-xs"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
