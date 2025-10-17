import type { APIRoute } from 'astro';
import { uploadToR2, initializeR2 } from '../../lib/r2-storage';
import { sendAdminNotification, sendArtistConfirmation } from '../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get R2 binding from locals or undefined in dev
    const binding = locals?.runtime?.env?.MY_BUCKET;
    
    // Initialize R2 client
    initializeR2(binding);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderName = formData.get('folderName') as string | null;
    const parentFolderId = formData.get('parentFolderId') as string | null;
    const submissionData = formData.get('submissionData') as string | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine the folder path
    let folderPath = '';
    let isFirstUpload = false;
    
    if (parentFolderId) {
      // If parentFolderId exists, use it (for subsequent file uploads)
      folderPath = parentFolderId;
    } else if (folderName) {
      // If folderName exists, this is the first upload (metadata)
      folderPath = folderName;
      isFirstUpload = true;
    } else if (submissionData) {
      // Fallback: create folder from submission data
      const data = JSON.parse(submissionData);
      const timestamp = Date.now();
      const sanitizedArtist = data.artistName.replace(/[^a-z0-9]/gi, '_');
      folderPath = `${sanitizedArtist}-${timestamp}`;
      isFirstUpload = true;
    }

    const result = await uploadToR2({
      filename: file.name,
      buffer,
      contentType: file.type,
      folderPath: folderPath || undefined,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400 });
    }

    // If this is the first upload (metadata file), send emails
    if (isFirstUpload && submissionData) {
      try {
        const data = JSON.parse(submissionData);
        const accountId = import.meta.env.R2_ACCOUNT_ID;
        const folderUrl = `https://${import.meta.env.R2_BUCKET_NAME}.${accountId}.r2.cloudflarestorage.com/${folderPath}`;
        
        // Send both emails
        await Promise.all([
          sendAdminNotification({
            ...data,
            folderUrl
          }),
          sendArtistConfirmation(data)
        ]);

        console.log('Confirmation emails sent successfully');
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the upload if emails fail
      }
    }

    // Return the folder path as folderId for subsequent uploads
    return new Response(JSON.stringify({
      ...result,
      folderId: folderPath
    }), { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }),
      { status: 500 }
    );
  }
};