import { useState, useEffect, useCallback } from "react";
import { theme, baseBtn } from "./theme";
import { STATUS, CATEGORIES, formatYen } from "./utils";
import { loadItems, loadListings, saveItems, saveListings } from "./storage";
import { Card } from "./components/Card";
import { BottomNav } from "./components/BottomNav";
import { ItemForm } from "./components/ItemForm";
import { ListingForm } from "./components/ListingForm";
import { BuyingSession } from "./components/BuyingSession";

const Shell = ({ children, style }) => (
  <div style={{
    background: theme.bg, minHeight: "100vh", color: theme.text,
    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    ...style,
  }}>{children}</div>
);

export const App = () => {
  const [items, setItems] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState("buying");
  const [view, setView] = useState("list");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setListings(loadListings());
    setLoaded(true);
  }, []);

  useEffect(() => { loaded && saveItems(items); }, [items, loaded]);
  useEffect(() => { loaded && saveListings(listings); }, [listings, loaded]);

  const addItem = useCallback((item) => {
    setItems(prev => [item, ...prev]);
    setView("list");
  }, []);

  const addBulkItems = useCallback((newItems) => {
    setItems(prev => [...newItems, ...prev]);
    setView("list");
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

  const markSold = useCallback((listingId) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "売却済" } : l));
    const listing = listings.find(l => l.id === listingId);
    listing && setItems(prev => prev.map(i => listing.itemIds.includes(i.id) ? { ...i, status: STATUS.SOLD } : i));
  }, [listings]);

  const resetAll = useCallback(() =>
    confirm("全データを削除しますか？") && (setItems([]), setListings([]))
  , []);

  const goList = () => setView("list");

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

  return !loaded ? (
    <Shell style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: theme.textMuted }}>読み込み中...</span>
    </Shell>
  ) : view === "addItem" ? (
    <Shell><ItemForm onSave={addItem} onCancel={goList} /></Shell>
  ) : view === "addBuying" ? (
    <Shell><BuyingSession onAddItems={addBulkItems} onCancel={goList} /></Shell>
  ) : view === "addListing" ? (
    <Shell><ListingForm items={items} onSave={addListing} onCancel={goList} /></Shell>
  ) : (
    <Shell style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>myodai</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>在庫管理プロトタイプ</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>{formatYen(totalStockValue)}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{stockItems.length + listedItems.length}点 在庫</div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "0 16px" }}>

        {/* Buying タブ */}
        {tab === "buying" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setView("addItem")} style={{
                ...baseBtn, flex: 1, padding: 14, background: theme.accent, color: "#fff",
              }}>＋ 1点登録</button>
              <button onClick={() => setView("addBuying")} style={{
                ...baseBtn, flex: 1, padding: 14, background: theme.surface2, color: theme.text,
                border: `1px solid ${theme.border}`,
              }}>＋ まとめ買い</button>
            </div>

            {buyingItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>＋</div>
                <div style={{ fontSize: 14 }}>買い付けた個体がありません</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>上のボタンから登録できます</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {buyingItems.map(item => (
                  <Card key={item.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                          {item.managementNo} · {item.category}
                          {item.brand && ` · ${item.brand}`}
                        </div>
                        {item.note && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{item.note}</div>}
                      </div>
                      <button onClick={() => advanceToPic(item.id)} style={{
                        ...baseBtn, padding: "8px 14px", flexShrink: 0,
                        background: theme.accentSoft, color: theme.accent, fontSize: 13,
                      }}>→ Pic</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pic タブ */}
        {tab === "pick" && (
          <>
            {pickingItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◇</div>
                <div style={{ fontSize: 14 }}>撮影待ちの個体はありません</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Buyingタブから「→ Pic」で送ると表示されます</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pickingItems.map(item => (
                  <Card key={item.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                          {item.managementNo} · {item.category}
                          {item.brand && ` · ${item.brand}`}
                        </div>
                        {item.note && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{item.note}</div>}
                      </div>
                      <button onClick={() => advanceToStock(item.id)} style={{
                        ...baseBtn, padding: "8px 14px", flexShrink: 0,
                        background: theme.successSoft, color: theme.success, fontSize: 13,
                      }}>→ 在庫</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* 在庫タブ */}
        {tab === "stock" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "在庫金額", value: formatYen(totalStockValue), color: theme.accent },
                { label: "在庫点数", value: `${stockItems.length}点`, color: theme.text },
                { label: "出品中", value: `${listedItems.length}点`, color: theme.warning },
                { label: "売却済", value: `${items.filter(i => i.status === STATUS.SOLD).length}点`, color: theme.success },
              ].map((m, i) => (
                <Card key={i} style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                </Card>
              ))}
            </div>

            {stockItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: theme.textMuted }}>
                <div style={{ fontSize: 14 }}>在庫がありません</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>検品が完了した個体がここに表示されます</div>
              </div>
            ) : (
              <>
                <Card style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: theme.text }}>カテゴリ別</div>
                  {CATEGORIES.map(cat => {
                    const catItems = stockItems.filter(i => i.category === cat);
                    return catItems.length === 0 ? null : (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: 14, color: theme.text }}>{cat}</span>
                        <span style={{ fontSize: 13, color: theme.textMuted }}>
                          {catItems.length}点 · {formatYen(catItems.reduce((s, i) => s + (i.cost || 0), 0))}
                        </span>
                      </div>
                    );
                  })}
                </Card>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stockItems.map(item => (
                    <Card key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: theme.textMuted }}>
                            {item.managementNo} · {item.category}
                            {item.brand && ` · ${item.brand}`}
                          </div>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: theme.text, flexShrink: 0, marginLeft: 12 }}>
                          {formatYen(item.cost)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <button onClick={resetAll} style={{
              ...baseBtn, width: "100%", padding: 12, marginTop: 20,
              background: "transparent", color: theme.danger, border: `1px solid ${theme.danger}33`,
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
              <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>▤</div>
                <div style={{ fontSize: 14 }}>出品がまだありません</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>在庫の個体を束ねて出品を作成します</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {listings.map(listing => {
                  const listingItems = items.filter(i => listing.itemIds.includes(i.id));
                  const costTotal = listingItems.reduce((s, i) => s + (i.cost || 0), 0);
                  const isSold = listing.status === "売却済";
                  return (
                    <Card key={listing.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{listing.title}</div>
                          <div style={{ fontSize: 12, color: theme.textMuted }}>{listing.itemIds.length}個体 · 原価 {formatYen(costTotal)}</div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                          background: isSold ? theme.accentSoft : theme.warningSoft,
                          color: isSold ? theme.accent : theme.warning,
                        }}>{listing.status}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                        {listingItems.map(it => (
                          <span key={it.id} style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 5,
                            background: theme.surface2, color: theme.textMuted,
                          }}>{it.managementNo}</span>
                        ))}
                      </div>
                      {listing.startPrice > 0 && (
                        <div style={{ fontSize: 13, color: theme.text }}>開始価格: {formatYen(listing.startPrice)}</div>
                      )}
                      {!isSold && (
                        <button onClick={() => markSold(listing.id)} style={{
                          ...baseBtn, marginTop: 8, padding: "8px 16px",
                          background: theme.successSoft, color: theme.success, fontSize: 13,
                        }}>売却済みにする</button>
                      )}
                    </Card>
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
