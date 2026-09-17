/**
 * MatPlan was written against a hosted `window.storage` KV API (get/set
 * returning promises). Running as a standalone site, back it with
 * localStorage so the rest of the app's persistence code needs no changes.
 */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = window.localStorage.getItem(key);
        return { value };
      } catch (err) {
        return { value: null };
      }
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
    },
  };
}
