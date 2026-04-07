import { useState } from "react";
import { theme, baseBtn } from "../theme";
import { STATUS, CATEGORIES, genId, genManagementNo } from "../utils";
import { Field } from "./Field";

export const ItemForm = ({ onSave, onCancel, buyingId }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("チェア");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () =>
    name.trim() && onSave({
      id: genId(),
      managementNo: genManagementNo(),
      name: name.trim(),
      category,
      brand: brand.trim(),
      cost: Number(cost) || 0,
      note: note.trim(),
      status: STATUS.BUYING,
      buyingId: buyingId ?? null,
      createdAt: new Date().toISOString(),
    });

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
            <label style={{ display: "block", fontSize: 12, color: theme.textMuted, marginBottom: 4, fontWeight: 600 }}>カテゴリ</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface2, color: theme.text, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" }}>
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
};
