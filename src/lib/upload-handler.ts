interface SubmissionData {
  artistName: string;
  email: string;
  releaseName: string;
  bpm: string;
  genre: string;
  customGenre?: string;
  notes: string;
  releaseDateType: string;
  releaseDate?: string;
}

export async function uploadSubmission(
  formData: SubmissionData,
  files: File[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (files.length === 0) {
      return { success: false, error: 'No files provided' };
    }

    const timestamp = Date.now();
    const folderName = `${formData.artistName.replace(/[^a-z0-9]/gi, '_')}-${timestamp}`;

    // Handle custom genre
const genre = formData.genre === 'custom' && formData.customGenre 
  ? formData.customGenre 
  : formData.genre;

const metadata = {
  ...formData,
  genre: genre,
  uploadedAt: new Date().toISOString(),
};

    const metadataBlob = new Blob(
      [JSON.stringify(metadata, null, 2)],
      { type: 'application/json' }
    );
    const metadataFile = new File([metadataBlob], 'info.json', {
      type: 'application/json'
    });

    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataFile);
    metadataFormData.append('folderName', folderName);

    const metadataResponse = await fetch('/api/upload-to-drive', {
      method: 'POST',
      body: metadataFormData,
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to create submission folder');
    }

    const metadataResult = await metadataResponse.json();
    const submissionFolderId = metadataResult.folderId;

    for (const file of files) {
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      fileFormData.append('parentFolderId', submissionFolderId);

      const fileResponse = await fetch('/api/upload-to-drive', {
        method: 'POST',
        body: fileFormData,
      });

      if (!fileResponse.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}