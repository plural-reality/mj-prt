import { useState, useEffect, useCallback } from "react";
import { theme, baseBtn } from "./theme";
import { STATUS, CATEGORIES, formatYen } from "./utils";
import { loadItems, loadListings, loadBuyings, saveItems, saveListings, saveBuyings } from "./storage";
import { BottomNav } from "./components/BottomNav";
import { ItemForm } from "./components/ItemForm";
import { ListingForm } from "./components/ListingForm";
import { BuyingForm } from "./components/BuyingForm";
import { PhotoStrip } from "./components/PhotoStrip";

const Shell = ({ children, style }) => (
  <div style={{
    background: theme.bg, minHeight: "100vh", color: theme.text,
    fontFamily: "-apple-system, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
    WebkitFontSmoothing: "antialiased",
    ...style,
  }}>{children}</div>
);

const Thumb = ({ src }) => (
  <img src={src} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
);

export const App = () => {
  const [items, setItems] = useState([]);
  const [listings, setListings] = useState([]);
  const [buyings, setBuyings] = useState([]);
  const [tab, setTab] = useState("buying");
  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);
  const [addItemBuyingId, setAddItemBuyingId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setListings(loadListings());
    setBuyings(loadBuyings());
    setLoaded(true);
  }, []);

  useEffect(() => { loaded && saveItems(items); }, [items, loaded]);
  useEffect(() => { loaded && saveListings(listings); }, [listings, loaded]);
  useEffect(() => { loaded && saveBuyings(buyings); }, [buyings, loaded]);

  const addBuying = useCallback((buying, firstItem) => {
    setBuyings(prev => [buying, ...prev]);
    firstItem && setItems(prev => [firstItem, ...prev]);
    setView("list");
  }, []);

  const addItem = useCallback((item) => {
    setItems(prev => [item, ...prev]);
    setAddItemBuyingId(null);
    setView("list");
  }, []);

  const updateItem = useCallback((updated) => {
    setItems(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    setEditingItem(null);
    setView("list");
  }, []);

  const startEditItem = useCallback((item) => {
    setEditingItem(item);
    setView("editItem");
  }, []);

  const startAddItemToBuying = useCallback((buyingId) => {
    setAddItemBuyingId(buyingId);
    setView("addItem");
  }, []);

  const addListing = useCallback((listing) => {
    setListings(prev => [listing, ...prev]);
    setItems(prev => prev.map(i => listing.itemIds.includes(i.id) ? { ...i, status: STATUS.LISTED } : i));
    setView("list");
    setTab("listing");
  }, []);

  const advanceToPic = useCallback((itemId) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: STATUS.PICKING } : i));
  }, []);

  const advanceToStock = useCallback((itemId) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: STATUS.STOCK } : i));
  }, []);

  const updatePhotos = useCallback((itemId, photos) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, photos } : i));
  }, []);

  const markSold = useCallback((listingId) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "売却済" } : l));
    const listing = listings.find(l => l.id === listingId);
    listing && setItems(prev => prev.map(i => listing.itemIds.includes(i.id) ? { ...i, status: STATUS.SOLD } : i));
  }, [listings]);

  const resetAll = useCallback(() =>
    confirm("全データを削除しますか？") && (setItems([]), setListings([]), setBuyings([]))
  , []);

  const goList = () => (setView("list"), setEditingItem(null), setAddItemBuyingId(null));

  const buyingItems = items.filter(i => i.status === STATUS.BUYING);
  const pickingItems = items.filter(i => i.status === STATUS.PICKING);
  const stockItems = items.filter(i => i.status === STATUS.STOCK);
  const listedItems = items.filter(i => i.status === STATUS.LISTED);
  const totalStockValue = [...stockItems, ...listedItems].reduce((s, i) => s + (i.cost || 0), 0);
  const counts = {
    buying: buyingItems.length,
    pick: pickingItems.length,
    stock: stockItems.length,
    listing: listings.filter(l => l.status !== "売却済").length,
  };

  const itemsForBuying = (buyingId) => items.filter(i => i.buyingId === buyingId);

  return !loaded ? (
    <Shell style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: theme.textMuted }}>読み込み中...</span>
    </Shell>
  ) : view === "addItem" ? (
    <Shell><ItemForm onSave={addItem} onCancel={goList} buyingId={addItemBuyingId} /></Shell>
  ) : view === "editItem" && editingItem ? (
    <Shell><ItemForm onSave={updateItem} onCancel={goList} item={editingItem} buyingId={editingItem.buyingId} /></Shell>
  ) : view === "addBuying" ? (
    <Shell><BuyingForm onSave={addBuying} onCancel={goList} /></Shell>
  ) : view === "addListing" ? (
    <Shell><ListingForm items={items} onSave={addListing} onCancel={goList} /></Shell>
  ) : (
    <Shell style={{ paddingBottom: 84 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8 }}>CLASS DESIGN INF</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{formatYen(totalStockValue)}</div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>{stockItems.length + listedItems.length}点</div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "0 16px" }}>

        {/* Buying タブ */}
        {tab === "buying" && (
          <>
            <button onClick={() => setView("addBuying")} style={{
              ...baseBtn, width: "100%", padding: 14, marginBottom: 16,
              background: theme.accent, color: "#fff",
            }}>＋ 仕入れ</button>

            {buyings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: theme.textMuted }}>
                <div style={{ fontSize: 15 }}>仕入れがまだありません</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {buyings.map(buying => {
                  const linkedItems = itemsForBuying(buying.id);
                  return (
                    <div key={buying.id} style={{ background: theme.surface, borderRadius: 16, overflow: "hidden" }}>
                      {/* Buying header */}
                      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2 }}>{buying.supplier}</div>
                          <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
                            {formatYen(buying.totalCost)} · {linkedItems.length}点
                          </div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 6,
                          background: theme.accentSoft, color: theme.accent,
                        }}>
                          {new Date(buying.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Linked items */}
                      {linkedItems.map((item, idx) => (
                        <div key={item.id} onClick={() => startEditItem(item)} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 16px 10px 28px",
                          borderTop: `0.5px solid ${theme.separator}`,
                          cursor: "pointer",
                        }}>
                          {item.photos?.[0] && <Thumb src={item.photos[0]} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: -0.2 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 1 }}>
                              {item.managementNo} · {item.category}
                              {item.brand && ` · ${item.brand}`}
                            </div>
                          </div>
                          {item.status === STATUS.BUYING && (
                            <button onClick={(e) => (e.stopPropagation(), advanceToPic(item.id))} style={{
                              ...baseBtn, padding: "6px 12px", flexShrink: 0,
                              background: theme.accentSoft, color: theme.accent, fontSize: 13, fontWeight: 500,
                            }}>→ Pic</button>
                          )}
                          {item.status !== STATUS.BUYING && (
                            <span style={{
                              fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 6,
                              background: theme.successSoft, color: theme.success,
                            }}>{item.status}</span>
                          )}
                        </div>
                      ))}

                      {/* Add item button */}
                      <div style={{ borderTop: `0.5px solid ${theme.separator}`, padding: "10px 16px" }}>
                        <button onClick={() => startAddItemToBuying(buying.id)} style={{
                          ...baseBtn, background: "none", color: theme.accent, padding: 0,
                          fontSize: 14, fontWeight: 500,
                        }}>＋ アイテム追加</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Pic タブ */}
        {tab === "pick" && (
          <>
            {pickingItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: theme.textMuted }}>
                <div style={{ fontSize: 15 }}>撮影待ちの個体はありません</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pickingItems.map(item => (
                  <div key={item.id} style={{ background: theme.surface, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
                          {item.managementNo} · {item.category}
                        </div>
                      </div>
                      <button onClick={() => advanceToStock(item.id)} style={{
                        ...baseBtn, padding: "7px 14px", flexShrink: 0,
                        background: theme.successSoft, color: theme.success, fontSize: 14, fontWeight: 500,
                      }}>→ 在庫</button>
                    </div>
                    <PhotoStrip
                      photos={item.photos ?? []}
                      onChange={(photos) => updatePhotos(item.id, photos)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 在庫タブ */}
        {tab === "stock" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "在庫金額", value: formatYen(totalStockValue) },
                { label: "在庫点数", value: `${stockItems.length}点` },
                { label: "出品中", value: `${listedItems.length}点` },
                { label: "売却済", value: `${items.filter(i => i.status === STATUS.SOLD).length}点` },
              ].map((m, i) => (
                <div key={i} style={{
                  background: theme.surface, borderRadius: 16,
                  padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {stockItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: theme.textMuted }}>
                <div style={{ fontSize: 15 }}>在庫がありません</div>
              </div>
            ) : (
              <>
                <div style={{ background: theme.surface, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ padding: "12px 16px 8px", fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>カテゴリ別</div>
                  {CATEGORIES.map(cat => {
                    const catItems = stockItems.filter(i => i.category === cat);
                    return catItems.length === 0 ? null : (
                      <div key={cat} style={{
                        display: "flex", justifyContent: "space-between", padding: "10px 16px",
                        borderTop: `0.5px solid ${theme.separator}`,
                      }}>
                        <span style={{ fontSize: 15, color: theme.text }}>{cat}</span>
                        <span style={{ fontSize: 15, color: theme.textMuted }}>
                          {catItems.length}点 · {formatYen(catItems.reduce((s, i) => s + (i.cost || 0), 0))}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: theme.surface, borderRadius: 16, overflow: "hidden" }}>
                  {stockItems.map((item, idx) => (
                    <div key={item.id} onClick={() => startEditItem(item)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px",
                      borderTop: idx > 0 ? `0.5px solid ${theme.separator}` : "none",
                      cursor: "pointer",
                    }}>
                      {item.photos?.[0] && <Thumb src={item.photos[0]} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
                          {item.managementNo} · {item.category}
                          {item.brand && ` · ${item.brand}`}
                        </div>
                      </div>
                      <span style={{ fontSize: 17, fontWeight: 500, flexShrink: 0, marginLeft: 12 }}>
                        {formatYen(item.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button onClick={resetAll} style={{
              ...baseBtn, width: "100%", padding: 14, marginTop: 24,
              background: "transparent", color: theme.danger, fontSize: 17, fontWeight: 400,
            }}>全データをリセット</button>
          </>
        )}

        {/* 出品タブ */}
        {tab === "listing" && (
          <>
            <button onClick={() => setView("addListing")} style={{
              ...baseBtn, width: "100%", padding: 14, marginBottom: 16,
              background: theme.accent, color: "#fff",
            }}>＋ 出品を作成</button>

            {listings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: theme.textMuted }}>
                <div style={{ fontSize: 15 }}>出品がまだありません</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {listings.map(listing => {
                  const listingItems = items.filter(i => listing.itemIds.includes(i.id));
                  const allPhotos = listingItems.flatMap(i => i.photos ?? []);
                  const costTotal = listingItems.reduce((s, i) => s + (i.cost || 0), 0);
                  const isSold = listing.status === "売却済";
                  return (
                    <div key={listing.id} style={{ background: theme.surface, borderRadius: 16, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2 }}>{listing.title}</div>
                          <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{listing.itemIds.length}個体 · 原価 {formatYen(costTotal)}</div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 6,
                          background: isSold ? "rgba(142,142,147,0.12)" : theme.warningSoft,
                          color: isSold ? theme.textMuted : theme.warning,
                        }}>{listing.status}</span>
                      </div>
                      {allPhotos.length > 0 && (
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10 }}>
                          {allPhotos.map((src, i) => (
                            <img key={i} src={src} style={{
                              width: 56, height: 56, objectFit: "cover",
                              borderRadius: 8, flexShrink: 0,
                            }} />
                          ))}
                        </div>
                      )}
                      {listing.startPrice > 0 && (
                        <div style={{ fontSize: 13, color: theme.textMuted }}>開始価格: {formatYen(listing.startPrice)}</div>
                      )}
                      {!isSold && (
                        <button onClick={() => markSold(listing.id)} style={{
                          ...baseBtn, marginTop: 10, padding: "7px 14px",
                          background: theme.successSoft, color: theme.success, fontSize: 14, fontWeight: 500,
                        }}>売却済みにする</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setView("list"); }} counts={counts} />
    </Shell>
  );
};
