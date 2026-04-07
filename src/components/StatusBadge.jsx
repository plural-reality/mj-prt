import { theme } from "../theme";
import { STATUS } from "../utils";

const colors = {
  [STATUS.BUYING]: { bg: "rgba(120,160,220,0.12)", color: "#78A0DC" },
  [STATUS.PICKING]: { bg: "rgba(160,140,200,0.12)", color: "#A08CC8" },
  [STATUS.STOCK]: { bg: theme.successSoft, color: theme.success },
  [STATUS.LISTED]: { bg: theme.warningSoft, color: theme.warning },
  [STATUS.SOLD]: { bg: theme.accentSoft, color: theme.accent },
};

export const StatusBadge = ({ status }) => {
  const c = colors[status] ?? colors[STATUS.STOCK];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6,
      fontSize: 12, fontWeight: 600, background: c.bg, color: c.color,
      letterSpacing: 0.5,
    }}>{status}</span>
  );
};
