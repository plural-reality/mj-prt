import { useState } from "react";
import { theme, baseBtn, inputStyle, labelStyle } from "../theme";
import { CATEGORIES, genId, genManagementNo, STATUS } from "../utils";
import { Field } from "./Field";

export const BuyingForm = ({ onSave, onCancel }) => {
  const [supplier, setSupplier] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("チェア");

  const canSave = supplier.trim() && totalCost.trim();

  const handleSave = () => {
    const buyingId = genId();
    const buying = {
      id: buyingId,
      supplier: supplier.trim(),
      totalCost: Number(totalCost) || 0,
      createdAt: new Date().toISOString(),
    };
    const firstItem = itemName.trim()
      ? {
          id: genId(),
          managementNo: genManagementNo(),
          name: itemName.trim(),
          category: itemCategory,
          brand: "",
          cost: Number(totalCost) || 0,
          note: "",
          status: STATUS.BUYING,
          buyingId,
          createdAt: new Date().toISOString(),
        }
      : null;
    canSave && onSave(buying, firstItem);
  };

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", marginBottom: 8,
      }}>
        <button onClick={onCancel} style={{ ...baseBtn, background: "none", color: theme.accent, padding: 0, fontSize: 17, fontWeight: 400 }}>キャンセル</button>
        <span style={{ fontWeight: 600, fontSize: 17, color: theme.text, letterSpacing: -0.4 }}>仕入れを登録</span>
        <button onClick={handleSave} style={{
          ...baseBtn, background: "none", padding: 0, fontSize: 17, fontWeight: 600,
          color: canSave ? theme.accent : theme.textMuted,
          opacity: canSave ? 1 : 0.5,
        }}>保存</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="仕入先" value={supplier} onChange={setSupplier} placeholder="業者名・マーケット名" autoFocus />
        <Field label="金額（円）" value={totalCost} onChange={setTotalCost} placeholder="0" type="number" inputMode="numeric" />
      </div>

      <div style={{
        marginTop: 24, padding: "16px", borderRadius: 16,
        background: theme.surface, border: `0.5px solid ${theme.separator}`,
      }}>
        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12, fontWeight: 500 }}>
          最初のアイテム（任意）
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="品名" value={itemName} onChange={setItemName} placeholder="ハーマンミラー イームズチェア" />
          <div>
            <label style={labelStyle}>カテゴリ</label>
            <select value={itemCategory} onChange={e => setItemCategory(e.target.value)}
              style={{ ...inputStyle }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 20, lineHeight: 1.5 }}>
        仕入先と金額を登録します。アイテムは後から追加できます。
      </p>
    </div>
  );
};
