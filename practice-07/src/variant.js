export const variantNumber = 6;

const FILTERS_BY_VARIANT = {
  1: { q: "", completed: "false", priority: "", categoryId: "" },
  2: { q: "", completed: "true", priority: "", categoryId: "" },
  3: { q: "", completed: "", priority: "high", categoryId: "" },
  4: { q: "", completed: "", priority: "medium", categoryId: "" },
  5: { q: "", completed: "", priority: "", categoryId: "1" },
  6: { q: "", completed: "", priority: "", categoryId: "2" },
  7: { q: "провер", completed: "", priority: "", categoryId: "" },
  8: { q: "", completed: "false", priority: "high", categoryId: "2" },
};

export function createInitialFilters(number = variantNumber) {
  return { ...FILTERS_BY_VARIANT[((number - 1) % 8) + 1] };
}

export const EMPTY_FILTERS = { q: "", completed: "", priority: "", categoryId: "" };
