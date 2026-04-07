import { useState } from "react";
import { theme, baseBtn } from "../theme";
import { STATUS, formatYen, genId } from "../utils";
import { Field } from "./Field";

export const ListingForm = ({ items, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [startPrice, setStartPrice] = useState("");

  const available = items.filter(i => i.status === STATUS.STOCK);

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalCost = [...selected].reduce((sum, id) => {
    const it = items.find(i => i.id === id);
    return sum + (it?.cost ?? 0);
  }, 0);

  const handleSave = () =>
    title.trim() && selected.size > 0 && onSave({
      id: genId(),
      title: title.trim(),
      itemIds: [...selected],
      startPrice: Number(startPrice) || 0,
      status: "出品準備",
      createdAt: new Date().toISOString(),
    });

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", marginBottom: 8,
      }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 400 }}>キャンセル</button>
        <span style={{ fontWeight: 600, fontSize: 17, color: theme.text, letterSpacing: -0.4 }}>出品を作成</span>
        <button onClick={handleSave} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 600 }}>作成</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="出品タイトル" value={title} onChange={setTitle} placeholder="イームズチェア 5脚セット" autoFocus />
        <Field label="開始価格（円）" value={startPrice} onChange={setStartPrice} placeholder="0" type="number" inputMode="numeric" />
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: theme.textMuted }}>個体を選択（{selected.size}件）</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: theme.accent }}>{formatYen(totalCost)}</span>
        </div>

        {available.length === 0 ? (
          <p style={{ color: theme.textMuted, fontSize: 15, textAlign: "center", padding: 40 }}>在庫がありません</p>
        ) : (
          <div style={{ background: theme.surface, borderRadius: 16, overflow: "hidden" }}>
            {available.map((item, idx) => (
              <div key={item.id} onClick={() => toggle(item.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderTop: idx > 0 ? `0.5px solid ${theme.separator}` : "none",
                cursor: "pointer", transition: "background 0.15s",
                background: selected.has(item.id) ? theme.accentSoft : "transparent",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 11,
                  border: `2px solid ${selected.has(item.id) ? theme.accent : theme.textMuted}`,
                  background: selected.has(item.id) ? theme.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{selected.has(item.id) ? "✓" : ""}</span>
                {item.photos?.[0] && (
                  <img src={item.photos[0]} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: theme.text }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: theme.textMuted }}>{item.managementNo} · {item.category}</div>
                </div>
                <span style={{ fontSize: 13, color: theme.textMuted, flexShrink: 0 }}>{formatYen(item.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
