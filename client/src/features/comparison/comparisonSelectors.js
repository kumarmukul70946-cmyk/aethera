import { createSelector } from "@reduxjs/toolkit";

const selectComparisonState = (state) => state.comparison;

export const selectComparisonProductIds = createSelector(
  [selectComparisonState],
  (comp) => comp?.selectedProductIds || []
);

export const selectComparisonProducts = createSelector(
  [selectComparisonState],
  (comp) => comp?.selectedProducts || []
);

export const selectComparisonResult = createSelector(
  [selectComparisonState],
  (comp) => comp?.comparisonResult || null
);

export const selectComparisonStatus = createSelector(
  [selectComparisonState],
  (comp) => comp?.status || "idle"
);

export const selectComparisonError = createSelector(
  [selectComparisonState],
  (comp) => comp?.error || null
);

export const selectComparisonCount = createSelector(
  [selectComparisonProductIds],
  (ids) => ids.length
);

export const selectIsProductComparing = (productId) =>
  createSelector([selectComparisonProductIds], (ids) => {
    if (!productId) return false;
    const target = productId.toString();
    return ids.some((id) => id.toString() === target);
  });
