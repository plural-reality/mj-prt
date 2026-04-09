import { useState } from "react";
import { theme, baseBtn, inputStyle, labelStyle } from "../theme";
import { STATUS, CATEGORIES, genId, genManagementNo } from "../utils";
import { Field } from "./Field";

export const ItemForm = ({ onSave, onCancel, buyingId, item }) => {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "チェア");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [cost, setCost] = useState(item?.cost ? String(item.cost) : "");
  const [note, setNote] = useState(item?.note ?? "");

  const isEditing = !!item;

  const handleSave = () =>
    name.trim() && onSave(
      isEditing
        ? { ...item, name: name.trim(), category, brand: brand.trim(), cost: Number(cost) || 0, note: note.trim() }
        : {
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
          }
    );

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", marginBottom: 8,
      }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 400 }}>キャンセル</button>
        <span style={{ fontWeight: 600, fontSize: 17, color: theme.text, letterSpacing: -0.4 }}>
          {isEditing ? "個体を編集" : "個体を登録"}
        </span>
        <button onClick={handleSave} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 600 }}>保存</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="品名" value={name} onChange={setName} placeholder="ハーマンミラー イームズチェア" autoFocus />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>カテゴリ</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle }}>
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

      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 20, lineHeight: 1.5 }}>
        {isEditing ? "変更を保存します。" : "管理番号は自動採番されます。金額は後から入力可能です。"}
      </p>
    </div>
  );
};
