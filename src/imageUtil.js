const MAX_DIM = 400;
const QUALITY = 0.6;

export const resizeImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = Object.assign(document.createElement("canvas"), {
          width: img.width * scale,
          height: img.height * scale,
        });
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
