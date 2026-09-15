/**
 * 3D Product Customization Types and Configuration Helpers.
 */

export const CUSTOMIZATION_TYPES = {
  COLOR: "color",
  MATERIAL: "material"
};

/**
 * Creates an initial, pure serializable customization state from product configuration.
 *
 * @param {Object} configuration - product.customization object
 * @returns {Object} State mapping areaId -> selectedOption object
 */
export function createDefaultCustomizationState(configuration) {
  if (!configuration || !configuration.enabled || !Array.isArray(configuration.areas)) {
    return {};
  }

  const state = {};

  configuration.areas.forEach((area) => {
    if (!area.id || !Array.isArray(area.options) || area.options.length === 0) return;

    // Default to option specified by defaultOption or the first available option
    const defaultOpt =
      area.options.find((opt) => opt.id === area.defaultOption) || area.options[0];

    state[area.id] = {
      id: defaultOpt.id,
      name: defaultOpt.name,
      color: defaultOpt.color || defaultOpt.value,
      roughness: typeof defaultOpt.roughness === "number" ? defaultOpt.roughness : 0.4,
      metalness: typeof defaultOpt.metalness === "number" ? defaultOpt.metalness : 0.2
    };
  });

  return state;
}

/**
 * Formats customization state into clean summary labels for cart & order items.
 *
 * @param {Object} customizationState - mapping areaId -> selectedOption
 * @param {Object} configuration - product.customization
 * @returns {Array<{ areaName: string, optionName: string, color: string }>}
 */
export function formatCustomizationSummary(customizationState, configuration) {
  if (!customizationState || !configuration?.areas) return [];

  return configuration.areas
    .filter((area) => customizationState[area.id])
    .map((area) => {
      const selected = customizationState[area.id];
      return {
        areaId: area.id,
        areaName: area.name,
        optionName: selected.name,
        color: selected.color
      };
    });
}
