const defaultOptions = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
};
const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
export async function serializeImageFile(file, options = {}) {
  const settings = {
    ...defaultOptions,
    ...options,
  };
  const originalDataUrl = await readAsDataUrl(file);
  if (!file.type.startsWith("image/") || file.type === "image/gif")
    return originalDataUrl;
  try {
    const image = await createImageBitmap(file);
    const scale = Math.min(
      settings.maxWidth / image.width,
      settings.maxHeight / image.height,
      1,
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", {
      alpha: true,
    });
    context.drawImage(image, 0, 0, width, height);
    image.close?.();
    const blob = await canvasToBlob(canvas, "image/webp", settings.quality);
    if (!blob || blob.size >= file.size) return originalDataUrl;
    return readAsDataUrl(blob);
  } catch {
    return originalDataUrl;
  }
}
