import { labelStyle, inputStyle } from "../theme";

export const Field = ({ label, value, onChange, placeholder, type, multiline, autoFocus, inputMode }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
    ) : (
      <input type={type || "text"} inputMode={inputMode} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} autoFocus={autoFocus} />
    )}
  </div>
);
