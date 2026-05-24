/**
 * Client-side image processing for profile photos.
 *
 * Phone cameras (Android especially) produce 8–15 MB images that blow past
 * upload size limits and waste mobile data. This downscales to a sane max
 * dimension and re-encodes to JPEG before upload, so:
 *   - large photos become ~100–300 KB (fast upload, never trips size caps)
 *   - format is normalized to JPEG (displays everywhere)
 *
 * Runs in the browser via canvas. Returns a JPEG File. If decoding fails
 * (unsupported/corrupt), throws a clear error the caller surfaces.
 */

const MAX_DIM = 1024; // longest edge, px
const QUALITY = 0.85;

export async function processImageForUpload(file: File): Promise<File> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const { width, height } = fit(img.naturalWidth, img.naturalHeight, MAX_DIM);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image.');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', QUALITY),
  );
  if (!blob) throw new Error('Could not process image.');

  return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Couldn't read that image. Try another."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("That image format isn't supported. Try a JPG or PNG."));
    img.src = src;
  });
}

function fit(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const scale = w >= h ? max / w : max / h;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}
