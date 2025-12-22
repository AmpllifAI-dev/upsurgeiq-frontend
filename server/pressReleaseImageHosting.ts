import { storagePut } from "./storage";

/**
 * Generate random suffix for non-enumerable file paths
 */
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Upload press release image to S3
 */
export async function uploadPressReleaseImage(
  pressReleaseId: number,
  imageBuffer: Buffer,
  contentType: string
): Promise<{ url: string; key: string }> {
  const extension = contentType.split("/")[1] || "jpg";
  const fileKey = `press-releases/${pressReleaseId}/image-${randomSuffix()}.${extension}`;

  const result = await storagePut(fileKey, imageBuffer, contentType);

  return {
    url: result.url,
    key: fileKey,
  };
}

/**
 * Upload press release image from base64 string
 */
export async function uploadPressReleaseImageFromBase64(
  pressReleaseId: number,
  base64Data: string,
  contentType: string = "image/jpeg"
): Promise<{ url: string; key: string }> {
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64String, "base64");

  return uploadPressReleaseImage(pressReleaseId, imageBuffer, contentType);
}

/**
 * Upload multiple press release images
 */
export async function uploadMultiplePressReleaseImages(
  pressReleaseId: number,
  images: Array<{ buffer: Buffer; contentType: string }>
): Promise<Array<{ url: string; key: string }>> {
  const results = [];

  for (const image of images) {
    const result = await uploadPressReleaseImage(
      pressReleaseId,
      image.buffer,
      image.contentType
    );
    results.push(result);
  }

  return results;
}
