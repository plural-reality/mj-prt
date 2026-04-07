import { theme } from "../theme";
import { STATUS } from "../utils";

const colors = {
  [STATUS.BUYING]: { bg: theme.accentSoft, color: theme.accent },
  [STATUS.PICKING]: { bg: "rgba(175,130,255,0.1)", color: "#AF82FF" },
  [STATUS.STOCK]: { bg: theme.successSoft, color: theme.success },
  [STATUS.LISTED]: { bg: theme.warningSoft, color: theme.warning },
  [STATUS.SOLD]: { bg: "rgba(142,142,147,0.12)", color: theme.textMuted },
};

export const StatusBadge = ({ status }) => {
  const c = colors[status] ?? colors[STATUS.STOCK];
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: 6,
      fontSize: 12, fontWeight: 500, background: c.bg, color: c.color,
    }}>{status}</span>
  );
};
