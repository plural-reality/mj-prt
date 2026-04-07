import { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = { items: "myodai-items", listings: "myodai-listings" };

const STATUS = { STOCK: "在庫", LISTED: "出品中", SOLD: "売却済" };
const CATEGORIES = ["チェア", "ソファ", "テーブル", "デスク", "照明", "収納", "その他"];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function genManagementNo() {
  const d = new Date();
  const prefix = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}`;
  const seq = String(Math.floor(Math.random()*9999)).padStart(4,"0");
  return `M${prefix}-${seq}`;
}

function formatYen(n) {
  return `¥${Number(n||0).toLocaleString()}`;
}

// ─── Persistent Storage ───
async function load(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function save(key, data) {
  try { await window.storage.set(key, JSON.stringify(data)); } catch(e) { console.error(e); }
}

// ─── Styles ───
const theme = {
  bg: "#0D0D0D",
  surface: "#1A1A1A",
  surface2: "#242424",
  border: "#333",
  text: "#E8E4DE",
  textMuted: "#8A8680",
  accent: "#D4764E",
  accentSoft: "rgba(212,118,78,0.12)",
  success: "#4A9E6E",
  successSoft: "rgba(74,158,110,0.12)",
  warning: "#C49A3C",
  warningSoft: "rgba(196,154,60,0.12)",
  danger: "#C0504D",
};

const baseBtn = {
  border: "none", borderRadius: 10, fontWeight: 600,
  fontSize: 15, cursor: "pointer", transition: "all 0.15s",
  fontFamily: "inherit",
};

// ─── Components ───

function StatusBadge({ status }) {
  const colors = {
    [STATUS.STOCK]: { bg: theme.successSoft, color: theme.success },
    [STATUS.LISTED]: { bg: theme.warningSoft, color: theme.warning },
    [STATUS.SOLD]: { bg: theme.accentSoft, color: theme.accent },
  };
  const c = colors[status] || colors[STATUS.STOCK];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6,
      fontSize: 12, fontWeight: 600, background: c.bg, color: c.color,
      letterSpacing: 0.5,
    }}>{status}</span>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: theme.surface, borderRadius: 14,
      border: `1px solid ${theme.border}`, padding: 16,
      ...(onClick ? { cursor: "pointer" } : {}),
      ...style,
    }}>{children}</div>
  );
}

function BottomNav({ tab, setTab, counts }) {
  const tabs = [
    { id: "items", label: "個体", icon: "◇" },
    { id: "listings", label: "出品", icon: "▤" },
    { id: "dash", label: "在庫", icon: "◎" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: theme.bg, borderTop: `1px solid ${theme.border}`,
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          ...baseBtn, background: "none", color: tab === t.id ? theme.accent : theme.textMuted,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "4px 20px", fontSize: 11,
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
          <span>{t.label}</span>
          {counts[t.id] > 0 && (
            <span style={{
              position: "absolute", top: 0, right: 8,
              background: theme.accent, color: "#fff",
              borderRadius: 10, fontSize: 10, padding: "1px 5px", fontWeight: 700,
            }}>{counts[t.id]}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

// ─── Item Form (Quick Add) ───
function ItemForm({ onSave, onCancel, buyingId }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("チェア");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: genId(),
      managementNo: genManagementNo(),
      name: name.trim(),
      category, brand: brand.trim(),
      cost: Number(cost) || 0,
      note: note.trim(),
      status: STATUS.STOCK,
      buyingId: buyingId || null,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.textMuted, padding: "8px 0" }}>キャンセル</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: theme.text }}>個体を登録</span>
        <button onClick={handleSave} style={{ ...baseBtn, background: theme.accent, color: "#fff", padding: "8px 18px" }}>保存</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="品名 *" value={name} onChange={setName} placeholder="ハーマンミラー イームズチェア" autoFocus />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>カテゴリ</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="ブランド" value={brand} onChange={setBrand} placeholder="Herman Miller" />
          </div>
        </div>
        <Field label="仕入単価（円）" value={cost} onChange={setCost} placeholder="0" type="number" inputMode="numeric" />
        <Field label="メモ" value={note} onChange={setNote} placeholder="状態・備考など" multiline />
      </div>

      <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 16, lineHeight: 1.6 }}>
        管理番号は自動採番されます。金額は後から入力可能です。
      </p>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: theme.textMuted, marginBottom: 4, fontWeight: 600 };
const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: `1px solid ${theme.border}`, background: theme.surface2,
  color: theme.text, fontSize: 16, fontFamily: "inherit",
  outline: "none", boxSizing: "border-box", WebkitAppearance: "none",
};

function Field({ label, value, onChange, placeholder, type, multiline, autoFocus, inputMode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
      ) : (
        <input type={type||"text"} inputMode={inputMode} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={inputStyle} autoFocus={autoFocus} />
      )}
    </div>
  );
}

// ─── Listing Form ───
function ListingForm({ items, onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [startPrice, setStartPrice] = useState("");

  const available = items.filter(i => i.status === STATUS.STOCK);

  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const totalCost = [...selected].reduce((sum, id) => {
    const it = items.find(i => i.id === id);
    return sum + (it?.cost || 0);
  }, 0);

  const handleSave = () => {
    if (!title.trim() || selected.size === 0) return;
    onSave({
      id: genId(),
      title: title.trim(),
      itemIds: [...selected],
      startPrice: Number(startPrice) || 0,
      status: "出品準備",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.textMuted, padding: "8px 0" }}>キャンセル</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: theme.text }}>出品を作成</span>
        <button onClick={handleSave} style={{ ...baseBtn, background: theme.accent, color: "#fff", padding: "8px 18px" }}>作成</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="出品タイトル *" value={title} onChange={setTitle} placeholder="イームズチェア 5脚セット" autoFocus />
        <Field label="開始価格（円）" value={startPrice} onChange={setStartPrice} placeholder="0" type="number" inputMode="numeric" />
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted }}>個体を選択（{selected.size}件）</span>
          <span style={{ fontSize: 13, color: theme.accent }}>原価合計 {formatYen(totalCost)}</span>
        </div>

        {available.length === 0 ? (
          <p style={{ color: theme.textMuted, fontSize: 14, textAlign: "center", padding: 30 }}>在庫がありません</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {available.map(item => (
              <div key={item.id} onClick={() => toggle(item.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: selected.has(item.id) ? theme.accentSoft : theme.surface2,
                border: `1px solid ${selected.has(item.id) ? theme.accent : theme.border}`,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${selected.has(item.id) ? theme.accent : theme.border}`,
                  background: selected.has(item.id) ? theme.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>{selected.has(item.id) ? "✓" : ""}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{item.managementNo} · {item.category}</div>
                </div>
                <span style={{ fontSize: 13, color: theme.textMuted, flexShrink: 0 }}>{formatYen(item.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Buying Session ───
function BuyingSession({ onAddItems, onCancel }) {
  const [rows, setRows] = useState([{ name: "", category: "チェア" }]);
  const [totalCost, setTotalCost] = useState("");
  const [note, setNote] = useState("");

  const addRow = () => setRows([...rows, { name: "", category: "チェア" }]);
  const updateRow = (i, field, val) => {
    const r = [...rows];
    r[i] = { ...r[i], [field]: val };
    setRows(r);
  };
  const removeRow = (i) => { if (rows.length > 1) setRows(rows.filter((_, j) => j !== i)); };

  const handleSave = () => {
    const validRows = rows.filter(r => r.name.trim());
    if (validRows.length === 0) return;
    const perItemCost = Number(totalCost) ? Math.round(Number(totalCost) / validRows.length) : 0;
    const buyingId = genId();
    const items = validRows.map(r => ({
      id: genId(),
      managementNo: genManagementNo(),
      name: r.name.trim(),
      category: r.category,
      brand: "",
      cost: perItemCost,
      note: note.trim() ? `[まとめ買い] ${note.trim()}` : "[まとめ買い]",
      status: STATUS.STOCK,
      buyingId,
      createdAt: new Date().toISOString(),
    }));
    onAddItems(items);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.textMuted, padding: "8px 0" }}>キャンセル</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: theme.text }}>まとめ買い</span>
        <button onClick={handleSave} style={{ ...baseBtn, background: theme.accent, color: "#fff", padding: "8px 18px" }}>
          {rows.filter(r=>r.name.trim()).length}件 登録
        </button>
      </div>

      <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
        品名だけ先に入れて、金額は後から。まとめ金額を入れると均等按分します。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: theme.textMuted, width: 20, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
            <input value={row.name} onChange={e => updateRow(i, "name", e.target.value)}
              placeholder="品名" style={{ ...inputStyle, flex: 1, padding: "10px 12px", fontSize: 15 }} />
            <select value={row.category} onChange={e => updateRow(i, "category", e.target.value)}
              style={{ ...inputStyle, width: 80, padding: "10px 6px", fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => removeRow(i)} style={{
              ...baseBtn, background: "none", color: theme.textMuted, padding: 4, fontSize: 18, width: 28,
              opacity: rows.length <= 1 ? 0.3 : 1,
            }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{
        ...baseBtn, width: "100%", padding: 12,
        background: theme.surface2, color: theme.textMuted,
        border: `1px dashed ${theme.border}`, marginBottom: 20,
      }}>＋ 行を追加</button>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="まとめ金額（円）" value={totalCost} onChange={setTotalCost} placeholder="均等按分" type="number" inputMode="numeric" />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="メモ" value={note} onChange={setNote} placeholder="仕入先など" />
        </div>
      </div>
      {Number(totalCost) > 0 && rows.filter(r=>r.name.trim()).length > 0 && (
        <p style={{ fontSize: 12, color: theme.accent, marginTop: 8 }}>
          → 1点あたり {formatYen(Math.round(Number(totalCost) / rows.filter(r=>r.name.trim()).length))}
        </p>
      )}
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [items, setItems] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState("items");
  const [view, setView] = useState("list"); // list | addItem | addBuying | addListing
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedItems, savedListings] = await Promise.all([load(STORAGE_KEYS.items), load(STORAGE_KEYS.listings)]);
      if (savedItems) setItems(savedItems);
      if (savedListings) setListings(savedListings);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) save(STORAGE_KEYS.items, items); }, [items, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.listings, listings); }, [listings, loaded]);

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
    setTab("listings");
  }, []);

  const markSold = useCallback((listingId) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "売却済" } : l));
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setItems(prev => prev.map(i => listing.itemIds.includes(i.id) ? { ...i, status: STATUS.SOLD } : i));
    }
  }, [listings]);

  const resetAll = useCallback(() => {
    if (confirm("全データを削除しますか？")) {
      setItems([]);
      setListings([]);
    }
  }, []);

  if (!loaded) return <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted }}>読み込み中...</div>;

  const stockItems = items.filter(i => i.status === STATUS.STOCK);
  const totalStockValue = stockItems.reduce((s, i) => s + (i.cost || 0), 0);
  const counts = {
    items: stockItems.length,
    listings: listings.filter(l => l.status !== "売却済").length,
    dash: 0,
  };

  // ─── Render views ───
  if (view === "addItem") return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
      <ItemForm onSave={addItem} onCancel={() => setView("list")} />
    </div>
  );
  if (view === "addBuying") return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
      <BuyingSession onAddItems={addBulkItems} onCancel={() => setView("list")} />
    </div>
  );
  if (view === "addListing") return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
      <ListingForm items={items} onSave={addListing} onCancel={() => setView("list")} />
    </div>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "'SF Pro Text', -apple-system, sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>myodai</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>在庫管理プロトタイプ</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>{formatYen(totalStockValue)}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{stockItems.length}点 在庫</div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "0 16px" }}>

        {tab === "items" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setView("addItem")} style={{
                ...baseBtn, flex: 1, padding: 14,
                background: theme.accent, color: "#fff",
              }}>＋ 1点登録</button>
              <button onClick={() => setView("addBuying")} style={{
                ...baseBtn, flex: 1, padding: 14,
                background: theme.surface2, color: theme.text,
                border: `1px solid ${theme.border}`,
              }}>＋ まとめ買い</button>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◇</div>
                <div style={{ fontSize: 14 }}>個体がまだ登録されていません</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>上のボタンから登録してください</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(item => (
                  <Card key={item.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                          {item.managementNo} · {item.category}
                          {item.brand && ` · ${item.brand}`}
                        </div>
                        {item.note && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{item.note}</div>}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: theme.text, flexShrink: 0, marginLeft: 12 }}>
                        {formatYen(item.cost)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "listings" && (
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
                  const costTotal = listingItems.reduce((s, i) => s + (i.cost||0), 0);
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

        {tab === "dash" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "在庫金額", value: formatYen(totalStockValue), color: theme.accent },
                { label: "在庫点数", value: `${stockItems.length}点`, color: theme.text },
                { label: "出品中", value: `${listings.filter(l=>l.status==="出品準備").length}件`, color: theme.warning },
                { label: "売却済", value: `${listings.filter(l=>l.status==="売却済").length}件`, color: theme.success },
              ].map((m, i) => (
                <Card key={i} style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                </Card>
              ))}
            </div>

            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: theme.text }}>カテゴリ別 在庫</div>
              {CATEGORIES.map(cat => {
                const catItems = stockItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;
                const catValue = catItems.reduce((s, i) => s + (i.cost||0), 0);
                return (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: 14, color: theme.text }}>{cat}</span>
                    <span style={{ fontSize: 13, color: theme.textMuted }}>{catItems.length}点 · {formatYen(catValue)}</span>
                  </div>
                );
              })}
            </Card>

            <button onClick={resetAll} style={{
              ...baseBtn, width: "100%", padding: 12, marginTop: 20,
              background: "transparent", color: theme.danger, border: `1px solid ${theme.danger}33`,
            }}>全データをリセット</button>
          </>
        )}
      </div>

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setView("list"); }} counts={counts} />
    </div>
  );
}