import React from "react";

/**
 * Reusable Quantity Selector component.
 * @param {Object} props
 * @param {number} props.quantity - Current value
 * @param {number} props.maxStock - Maximum allowable stock
 * @param {Function} props.onChange - Callback with new quantity
 * @param {boolean} [props.disabled=false]
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
    <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1 || disabled}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="w-9 text-center text-xs font-semibold text-slate-200">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxStock || disabled}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
