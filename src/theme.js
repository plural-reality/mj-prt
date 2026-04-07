export const theme = {
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

export const baseBtn = {
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

export const labelStyle = {
  display: "block",
  fontSize: 12,
  color: theme.textMuted,
  marginBottom: 4,
  fontWeight: 600,
};

export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.surface2,
  color: theme.text,
  fontSize: 16,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  WebkitAppearance: "none",
};
