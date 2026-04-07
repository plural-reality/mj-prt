import { useState } from "react";
import { theme, baseBtn, inputStyle } from "../theme";
import { CATEGORIES, genId, genManagementNo, STATUS, formatYen } from "../utils";
import { Field } from "./Field";

export const BuyingSession = ({ onAddItems, onCancel }) => {
  const [rows, setRows] = useState([{ name: "", category: "チェア" }]);
  const [totalCost, setTotalCost] = useState("");
  const [note, setNote] = useState("");

  const addRow = () => setRows(prev => [...prev, { name: "", category: "チェア" }]);
  const updateRow = (i, field, val) =>
    setRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: val } : r));
  const removeRow = (i) =>
    rows.length > 1 && setRows(prev => prev.filter((_, j) => j !== i));

  const validRows = rows.filter(r => r.name.trim());

  const handleSave = () => {
    const perItemCost = Number(totalCost) ? Math.round(Number(totalCost) / validRows.length) : 0;
    const buyingId = genId();
    validRows.length > 0 && onAddItems(
      validRows.map(r => ({
        id: genId(),
        managementNo: genManagementNo(),
        name: r.name.trim(),
        category: r.category,
        brand: "",
        cost: perItemCost,
        note: note.trim() ? `[まとめ買い] ${note.trim()}` : "[まとめ買い]",
        status: STATUS.BUYING,
        buyingId,
        createdAt: new Date().toISOString(),
      }))
    );
  };

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", marginBottom: 8,
      }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 400 }}>キャンセル</button>
        <span style={{ fontWeight: 600, fontSize: 17, color: theme.text, letterSpacing: -0.4 }}>まとめ買い</span>
        <button onClick={handleSave} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 600 }}>
          {validRows.length}件 登録
        </button>
      </div>

      <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
        品名だけ先に入れて、金額は後から。まとめ金額を入れると均等按分します。
      </p>

      <div style={{ background: theme.surface, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "center", padding: "10px 16px",
            borderTop: i > 0 ? `0.5px solid ${theme.separator}` : "none",
          }}>
            <span style={{ fontSize: 13, color: theme.textMuted, width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
            <input value={row.name} onChange={e => updateRow(i, "name", e.target.value)}
              placeholder="品名" style={{ ...inputStyle, flex: 1, padding: "8px 0", fontSize: 15, background: "transparent", borderRadius: 0 }} />
            <select value={row.category} onChange={e => updateRow(i, "category", e.target.value)}
              style={{ ...inputStyle, width: 72, padding: "8px 4px", fontSize: 13, background: "transparent", borderRadius: 0, textAlign: "right" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => removeRow(i)} style={{
              ...baseBtn, background: "none", color: theme.textMuted, padding: 0, fontSize: 18, width: 24,
              opacity: rows.length <= 1 ? 0.3 : 1,
            }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{
        ...baseBtn, width: "100%", padding: 12,
        background: theme.surface, color: theme.textMuted,
        marginBottom: 20, fontSize: 15,
      }}>＋ 行を追加</button>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="まとめ金額（円）" value={totalCost} onChange={setTotalCost} placeholder="均等按分" type="number" inputMode="numeric" />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="メモ" value={note} onChange={setNote} placeholder="仕入先など" />
        </div>
      </div>
      {Number(totalCost) > 0 && validRows.length > 0 && (
        <p style={{ fontSize: 13, color: theme.accent, marginTop: 10, fontWeight: 500 }}>
          → 1点あたり {formatYen(Math.round(Number(totalCost) / validRows.length))}
        </p>
      )}
    </div>
  );
};
