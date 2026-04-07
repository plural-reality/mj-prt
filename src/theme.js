export const theme = {
  bg: "#000000",
  surface: "rgba(255,255,255,0.05)",
  surface2: "rgba(255,255,255,0.07)",
  separator: "rgba(255,255,255,0.06)",
  text: "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.35)",
  accent: "#0A84FF",
  accentSoft: "rgba(10,132,255,0.12)",
  success: "#30D158",
  successSoft: "rgba(48,209,88,0.12)",
  warning: "#FF9F0A",
  warningSoft: "rgba(255,159,10,0.12)",
  danger: "#FF453A",
};

export const baseBtn = {
  border: "none",
  borderRadius: 14,
  fontWeight: 500,
  fontSize: 15,
  cursor: "pointer",
  transition: "opacity 0.15s",
  fontFamily: "inherit",
};

export const labelStyle = {
  display: "block",
  fontSize: 13,
  color: theme.textMuted,
  marginBottom: 6,
  fontWeight: 400,
  letterSpacing: -0.08,
};

export const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: theme.surface2,
  color: theme.text,
  fontSize: 17,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  WebkitAppearance: "none",
};
