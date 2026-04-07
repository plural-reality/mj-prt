export const STATUS = {
  BUYING: "買付済",
  PICKING: "撮影待ち",
  STOCK: "在庫",
  LISTED: "出品中",
  SOLD: "売却済",
};

export const CATEGORIES = ["チェア", "ソファ", "テーブル", "デスク", "照明", "収納", "その他"];

export const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const genManagementNo = () =>
  ((d) =>
    `M${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
  )(new Date());

export const formatYen = (n) => `¥${Number(n || 0).toLocaleString()}`;
