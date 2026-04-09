const KEYS = { items: "myodai-items", listings: "myodai-listings", buyings: "myodai-buyings" };

const load = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(e); }
};

export const loadItems = () => load(KEYS.items) ?? [];
export const loadListings = () => load(KEYS.listings) ?? [];
export const loadBuyings = () => load(KEYS.buyings) ?? [];
export const saveItems = (items) => save(KEYS.items, items);
export const saveListings = (listings) => save(KEYS.listings, listings);
export const saveBuyings = (buyings) => save(KEYS.buyings, buyings);
