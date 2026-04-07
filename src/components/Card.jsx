import { theme } from "../theme";

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: theme.surface,
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
    padding: 16,
    ...(onClick ? { cursor: "pointer" } : {}),
    ...style,
  }}>{children}</div>
);
