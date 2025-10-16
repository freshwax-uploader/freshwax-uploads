import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Configuration
const R2_ACCOUNT_ID = import.meta.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.R2_BUCKET_NAME;

// Storage limits
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB per file (adjust as needed)
const MAX_TOTAL_STORAGE = 9.5 * 1024 * 1024 * 1024; // 9.5GB total (safety buffer)

// Validate environment variables
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('Missing R2 environment variables');
}

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Get total bucket size
export async function getTotalBucketSize(): Promise<number> {
  try {
    let totalSize = 0;
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await r2Client.send(command);
      
      if (response.Contents) {
        totalSize += response.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return totalSize;
  } catch (error) {
    console.error('Error getting bucket size:', error);
    return 0;
  }
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

interface UploadFileOptions {
  filename: string;
  buffer: Buffer;
  contentType: string;
  folderPath?: string;
}

export async function uploadToR2({
  filename,
  buffer,
  contentType,
  folderPath = '',
}: UploadFileOptions) {
  try {
    // Check individual file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`,
      };
    }

    // Check total bucket size
    const currentSize = await getTotalBucketSize();
    const newTotalSize = currentSize + buffer.length;

    console.log(`Current storage: ${formatBytes(currentSize)} / ${formatBytes(MAX_TOTAL_STORAGE)}`);

    if (newTotalSize > MAX_TOTAL_STORAGE) {
      return {
        success: false,
        error: `Storage limit reached. Used: ${formatBytes(currentSize)} / ${formatBytes(MAX_TOTAL_STORAGE)}`,
      };
    }

    // Create the file key (path in bucket)
    const key = folderPath ? `${folderPath}/${filename}` : filename;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    console.log(`Upload successful: ${key} (${formatBytes(buffer.length)})`);

    return {
      success: true,
      key: key,
      size: buffer.length,
      url: `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function createFolder(folderName: string) {
  // R2 doesn't need explicit folder creation
  // Folders are created automatically when you upload files with a path
  return {
    success: true,
    folderName: folderName,
  };
}