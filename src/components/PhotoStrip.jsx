import { useRef } from "react";
import { theme, baseBtn } from "../theme";
import { resizeImage } from "../imageUtil";

const MAX_PHOTOS = 3;

export const PhotoStrip = ({ photos = [], onChange }) => {
  const inputRef = useRef(null);

  const handleFiles = (e) =>
    Promise.all(Array.from(e.target.files).map(resizeImage)).then((newPhotos) => {
      onChange([...photos, ...newPhotos].slice(0, MAX_PHOTOS));
      e.target.value = "";
    });

  const remove = (idx) =>
    onChange(photos.filter((_, i) => i !== idx));

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
      {photos.map((src, i) => (
        <div key={i} style={{ position: "relative", flexShrink: 0 }}>
          <img src={src} style={{
            width: 64, height: 64, objectFit: "cover",
            borderRadius: 10, display: "block",
          }} />
          <button onClick={() => remove(i)} style={{
            ...baseBtn, position: "absolute", top: -6, right: -6,
            width: 20, height: 20, borderRadius: 10, padding: 0,
            background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <button onClick={() => inputRef.current?.click()} style={{
          ...baseBtn, width: 64, height: 64, flexShrink: 0,
          background: theme.surface2, color: theme.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, borderRadius: 10,
        }}>+</button>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple
        onChange={handleFiles} style={{ display: "none" }} />
    </div>
  );
};
