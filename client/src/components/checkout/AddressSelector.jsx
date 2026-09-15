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
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Shipping Address
        </h3>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          + Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <p className="text-xs text-slate-400 mb-3">No saved addresses yet</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
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
                className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {addr.addressLine}, {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-xs text-slate-500">Phone: {addr.phone}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">
                    {isSelected ? "✓ Selected" : "Click to select"}
                  </span>
                  <div className="flex gap-2 text-slate-400">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(addr, e)}
                      className="hover:text-white"
                    >
                      Edit
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAddress(addr._id);
                      }}
                      className="hover:text-rose-400"
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
