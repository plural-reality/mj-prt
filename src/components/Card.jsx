import { theme } from "../theme";

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: theme.surface,
    borderRadius: 12,
    padding: 16,
    ...(onClick ? { cursor: "pointer" } : {}),
    ...style,
  }}>{children}</div>
);
