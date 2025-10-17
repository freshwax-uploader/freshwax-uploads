// Storage limits
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB per file
const MAX_TOTAL_STORAGE = 9.5 * 1024 * 1024 * 1024; // 9.5GB total

let r2Bucket: any = null;
let bucketName: string = 'freshwax-uploads';

// Initialize R2 client from Cloudflare binding
export function initializeR2(binding: any) {
  if (!binding) {
    throw new Error('R2 binding is required');
  }

  // Cloudflare R2 binding is used directly with put/get methods
  r2Bucket = binding;
}

// Get total bucket size
export async function getTotalBucketSize(): Promise<number> {
  try {
    if (!r2Bucket) {
      throw new Error('R2 bucket not initialized');
    }

    let totalSize = 0;

    // List all objects in the bucket
    const { objects } = await r2Bucket.list();

    if (objects) {
      totalSize = objects.reduce((sum: number, obj: any) => sum + (obj.size || 0), 0);
    }

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
    if (!r2Bucket) {
      throw new Error('R2 bucket not initialized');
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

    console.log(`Uploading to R2: ${key}`);

    // Upload to R2 using the binding's put method
    await r2Bucket.put(key, buffer, {
      httpMetadata: {
        contentType: contentType,
      },
    });

    console.log(`Upload successful: ${key} (${formatBytes(buffer.length)})`);

    return {
      success: true,
      key: key,
      size: buffer.length,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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