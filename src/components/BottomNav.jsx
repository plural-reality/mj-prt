import { theme, baseBtn } from "../theme";

const tabs = [
  { id: "buying", label: "Buying", icon: "＋" },
  { id: "pick", label: "Pic", icon: "◇" },
  { id: "stock", label: "在庫", icon: "◎" },
  { id: "listing", label: "出品", icon: "▤" },
];

export const BottomNav = ({ tab, setTab, counts }) => (
  <nav style={{
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: theme.bg, borderTop: `1px solid ${theme.border}`,
    display: "flex", justifyContent: "space-around",
    padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    zIndex: 100,
  }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{
        ...baseBtn, background: "none",
        color: tab === t.id ? theme.accent : theme.textMuted,
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
