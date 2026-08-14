export type PhotoCheckStatus = "pass" | "warning" | "advice";

export type PhotoCheck = {
  id: "resolution" | "compression" | "lighting" | "sharpness" | "face";
  label: string;
  status: PhotoCheckStatus;
  message: string;
};

type PhotoSource = {
  originalWidth: number;
  originalHeight: number;
  fileSize: number;
};

type FaceBox = { x: number; y: number; width: number; height: number };
type FaceDetectorLike = {
  detect(image: CanvasImageSource): Promise<Array<{ boundingBox: FaceBox }>>;
};
type FaceDetectorConstructor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => FaceDetectorLike;

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The photo preview could not be read."));
    image.src = dataUrl;
  });
}

function imageSignals(image: HTMLImageElement) {
  const width = 160;
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.min(220, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { brightness: 128, clipped: 0, sharpness: 100 };
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const grey = new Float32Array(canvas.width * canvas.height);
  let light = 0;
  let clipped = 0;

  for (let index = 0, pixel = 0; index < pixels.length; index += 4, pixel += 1) {
    const value = 0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
    grey[pixel] = value;
    light += value;
    if (value < 18 || value > 242) clipped += 1;
  }

  const laplacian: number[] = [];
  for (let y = 1; y < canvas.height - 1; y += 1) {
    for (let x = 1; x < canvas.width - 1; x += 1) {
      const centre = grey[y * canvas.width + x];
      laplacian.push(
        grey[(y - 1) * canvas.width + x] +
          grey[(y + 1) * canvas.width + x] +
          grey[y * canvas.width + x - 1] +
          grey[y * canvas.width + x + 1] -
          4 * centre
      );
    }
  }
  const mean = laplacian.reduce((sum, value) => sum + value, 0) / Math.max(1, laplacian.length);
  const variance = laplacian.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, laplacian.length);

  return {
    brightness: light / Math.max(1, grey.length),
    clipped: clipped / Math.max(1, grey.length),
    sharpness: variance,
  };
}

async function faceCheck(image: HTMLImageElement): Promise<PhotoCheck> {
  const detectorClass = (window as unknown as { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
  if (!detectorClass) {
    return {
      id: "face",
      label: "Face position",
      status: "advice",
      message: "Use the crop guide to keep your face centred with limited empty background.",
    };
  }

  try {
    const faces = await new detectorClass({ fastMode: true, maxDetectedFaces: 2 }).detect(image);
    if (faces.length !== 1) {
      return {
        id: "face",
        label: "Face position",
        status: "warning",
        message: faces.length === 0 ? "No clear face was detected." : "Use a photo showing only you.",
      };
    }
    const box = faces[0].boundingBox;
    const centreX = (box.x + box.width / 2) / image.naturalWidth;
    const centreY = (box.y + box.height / 2) / image.naturalHeight;
    const faceArea = (box.width * box.height) / (image.naturalWidth * image.naturalHeight);
    const centred = Math.abs(centreX - 0.5) < 0.2 && centreY > 0.2 && centreY < 0.62;
    if (!centred || faceArea < 0.08) {
      return {
        id: "face",
        label: "Face position",
        status: "warning",
        message: faceArea < 0.08 ? "Move closer or crop excess background." : "Move the crop so your face sits near the centre.",
      };
    }
    return { id: "face", label: "Face position", status: "pass", message: "One clear, centred face detected." };
  } catch {
    return {
      id: "face",
      label: "Face position",
      status: "advice",
      message: "Check the crop guide and keep your face near the centre.",
    };
  }
}

export async function analysePhotoQuality(dataUrl: string, source: PhotoSource): Promise<PhotoCheck[]> {
  const image = await loadImage(dataUrl);
  const shortestSide = Math.min(source.originalWidth, source.originalHeight);
  const bytesPerPixel = source.fileSize / Math.max(1, source.originalWidth * source.originalHeight);
  const signals = imageSignals(image);
  const checks: PhotoCheck[] = [
    shortestSide >= 600
      ? { id: "resolution", label: "Resolution", status: "pass", message: `${source.originalWidth} × ${source.originalHeight} pixels.` }
      : { id: "resolution", label: "Resolution", status: "warning", message: "Use an image at least 600 pixels on its shortest side." },
    source.fileSize >= 45_000 && bytesPerPixel >= 0.025
      ? { id: "compression", label: "File quality", status: "pass", message: "The image has enough detail for a CV." }
      : { id: "compression", label: "File quality", status: "warning", message: "This file may be heavily compressed. Use the original photo if possible." },
    signals.brightness >= 65 && signals.brightness <= 205 && signals.clipped < 0.22
      ? { id: "lighting", label: "Lighting", status: "pass", message: "Lighting is within a useful range." }
      : { id: "lighting", label: "Lighting", status: "warning", message: signals.brightness < 65 ? "The photo looks dark." : "The photo looks overexposed or has harsh lighting." },
    signals.sharpness >= 70
      ? { id: "sharpness", label: "Sharpness", status: "pass", message: "The image looks reasonably sharp." }
      : { id: "sharpness", label: "Sharpness", status: "warning", message: "The photo may be blurred. Use a sharper original." },
  ];
  checks.push(await faceCheck(image));
  return checks;
}

export async function cropPhoto(dataUrl: string, x: number, y: number, zoom: number) {
  const image = await loadImage(dataUrl);
  const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
  const sourceX = (image.naturalWidth - cropSize) * (x / 100);
  const sourceY = (image.naturalHeight - cropSize) * (y / 100);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The crop tool is unavailable in this browser.");
  context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 640, 640);
  return canvas.toDataURL("image/jpeg", 0.9);
}
