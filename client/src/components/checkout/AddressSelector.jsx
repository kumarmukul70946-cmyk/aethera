import React, { useState } from "react";
import AddressFormModal from "./AddressFormModal.jsx";

/**
 * AddressSelector Component.
 */
export default function AddressSelector({
  addresses = [],
  selectedId = null,
  onSelect,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  loading = false
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr, e) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingAddress) {
      await onUpdateAddress(editingAddress._id, formData);
    } else {
      await onCreateAddress(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">Step 1</span>
          <h3 className="text-base font-serif font-normal text-neutral-900">
            Shipping Address
          </h3>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition flex items-center gap-1.5"
        >
          <span className="text-sm">+</span> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/60">
          <p className="text-xs text-neutral-500 mb-3">No saved delivery addresses found</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedId === addr._id;
            return (
              <div
                key={addr._id}
                onClick={() => onSelect(addr._id)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-neutral-50/80 border-neutral-900 ring-1 ring-neutral-900 shadow-sm"
                    : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {addr.addressLine}, {addr.city}, {addr.state} &mdash; {addr.postalCode}
                  </p>
                  <p className="text-xs text-neutral-400">Phone: {addr.phone}</p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? "text-neutral-900 flex items-center gap-1" : "text-neutral-400"}`}>
                    {isSelected ? "● Selected" : "Click to select"}
                  </span>
                  <div className="flex gap-2.5 text-neutral-400 text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(addr, e)}
                      className="hover:text-neutral-900 transition"
                    >
                      Edit
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAddress(addr._id);
                      }}
                      className="hover:text-rose-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingAddress}
        loading={loading}
      />
    </div>
  );
}
