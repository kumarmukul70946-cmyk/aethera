import React from "react";
import { Link } from "react-router-dom";
import QuantitySelector from "./QuantitySelector.jsx";
import { CloseIcon } from "../common/Icons.jsx";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Individual Cart Item Row Component.
 */
export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false
}) {
  const { product, quantity, customization, unitPrice, itemSubtotal } = item;

  const productUrl = product?.slug
    ? `/product/${product.slug}`
    : `/products/${product?._id}`;

  const primaryImage =
    product?.images && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-slate-800/80 last:border-b-0">
      {/* Product Info & Thumbnail */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          to={productUrl}
          className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center group"
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <span className="text-2xl">✨</span>
          )}
        </Link>

        <div className="min-w-0 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            {product?.brand || "Aethera"}
          </span>
          <h4 className="font-semibold text-sm text-slate-100 truncate hover:text-indigo-300 transition">
            <Link to={productUrl}>{product?.name || "Product"}</Link>
          </h4>

          {/* Customizations (color / size / 3D) */}
          {customization && (
            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <div className="flex flex-wrap gap-2">
                {customization.color && (
                  <span className="capitalize">Color: {customization.color}</span>
                )}
                {customization.size && (
                  <span className="uppercase">Size: {customization.size}</span>
                )}
              </div>
              {customization.custom3D && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {Object.entries(customization.custom3D).map(([areaId, choice]) => (
                    <span
                      key={areaId}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 font-medium"
                    >
                      <span
                        style={{ backgroundColor: choice.color }}
                        className="w-2 h-2 rounded-full border border-black/40 shrink-0"
                      />
                      <span className="capitalize text-slate-400">{areaId}:</span>
                      <strong className="text-white">{choice.name}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="sm:hidden text-xs font-bold text-slate-300 pt-1">
            {formatCurrency(unitPrice)} each
          </div>
        </div>
      </div>

      {/* Quantity & Total Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
        {/* Unit Price (Desktop) */}
        <div className="hidden sm:block text-right">
          <p className="text-xs text-slate-500">Unit Price</p>
          <p className="text-sm font-semibold text-slate-300">
            {formatCurrency(unitPrice)}
          </p>
        </div>

        {/* Quantity Controls */}
        <QuantitySelector
          quantity={quantity}
          maxStock={product?.stock || 99}
          onChange={(newQty) => onUpdateQuantity(product._id, newQty)}
          disabled={disabled}
        />

        {/* Item Subtotal */}
        <div className="text-right min-w-20">
          <p className="hidden sm:block text-xs text-slate-500">Subtotal</p>
          <p className="text-sm sm:text-base font-bold text-white">
            {formatCurrency(itemSubtotal)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(product._id)}
          disabled={disabled}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
          aria-label="Remove item"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
