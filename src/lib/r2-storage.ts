import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Storage limits
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB per file
const MAX_TOTAL_STORAGE = 9.5 * 1024 * 1024 * 1024; // 9.5GB total

let r2Client: S3Client | null = null;
let bucketName: string = 'freshwax-uploads';
let accountId: string = '';

// Initialize R2 client from Cloudflare binding
export function initializeR2(binding: any) {
  if (!binding) {
    throw new Error('R2 binding is required');
  }

  // Cloudflare binding is an R2Bucket object, not an S3Client
  // We need to create an S3Client using the binding's credentials
  r2Client = new S3Client({
    region: 'auto',
    endpoint: binding.endpoint || `https://${binding.account_id}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: binding.access_key_id,
      secretAccessKey: binding.secret_access_key,
    },
  });

  if (binding.account_id) {
    accountId = binding.account_id;
  }
}

// Get total bucket size
export async function getTotalBucketSize(): Promise<number> {
  try {
    if (!r2Client) {
      throw new Error('R2 client not initialized');
    }

    let totalSize = 0;
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
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
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
    if (!r2Client) {
      throw new Error('R2 client not initialized');
    }

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

    console.log(
      `Current storage: ${formatBytes(currentSize)} / ${formatBytes(MAX_TOTAL_STORAGE)}`
    );

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
      Bucket: bucketName,
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
      url: `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`,
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