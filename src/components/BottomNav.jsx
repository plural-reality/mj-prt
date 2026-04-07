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
    background: "rgba(20,20,20,0.7)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    backdropFilter: "saturate(180%) blur(20px)",
    borderTop: `0.5px solid ${theme.separator}`,
    display: "flex", justifyContent: "space-around",
    padding: "6px 0 max(6px, env(safe-area-inset-bottom))",
    zIndex: 100,
  }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{
        ...baseBtn, background: "none", position: "relative",
        color: tab === t.id ? theme.accent : theme.textMuted,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        padding: "4px 20px", fontSize: 10, fontWeight: 500,
        letterSpacing: 0.02,
      }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
        <span>{t.label}</span>
        {counts[t.id] > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 8,
            background: theme.danger, color: "#fff",
            borderRadius: 9, fontSize: 11, minWidth: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 5px", fontWeight: 600,
          }}>{counts[t.id]}</span>
        )}
      </button>
    ))}
  </nav>
);
