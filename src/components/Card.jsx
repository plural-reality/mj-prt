import { theme } from "../theme";

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: theme.surface,
    borderRadius: 16,
    padding: 16,
    ...(onClick ? { cursor: "pointer" } : {}),
    ...style,
  }}>{children}</div>
);
