import type { APIRoute } from 'astro';
import { uploadToR2, createFolder } from '../../lib/r2-storage';
import { sendAdminNotification, sendArtistConfirmation } from '../../lib/email-service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderName = formData.get('folderName') as string;
    const parentFolderName = formData.get('parentFolderId') as string;
    const submissionData = formData.get('submissionData') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No file provided' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let uploadFolderPath = parentFolderName || '';
    
    // If folderName is provided and no parent, create a new folder path
    if (folderName && !parentFolderName) {
      const folderResult = await createFolder(folderName);
      if (folderResult.success) {
        uploadFolderPath = folderName;
      }
    }

    // Upload file to R2
    const result = await uploadToR2({
      filename: file.name,
      buffer,
      contentType: file.type || 'application/octet-stream',
      folderPath: uploadFolderPath,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify(result), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // If this is the metadata file and we have submission data, send emails
    if (file.name === 'info.json' && submissionData) {
      try {
        console.log('📧 Attempting to send emails...');
        console.log('Submission data:', submissionData);
        
        const data = JSON.parse(submissionData);
        
        // Send both emails
        const adminResult = await sendAdminNotification(data);
        console.log('Admin email result:', adminResult);
        
        const artistResult = await sendArtistConfirmation(data);
        console.log('Artist email result:', artistResult);
        
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError);
        // Don't fail the upload if emails fail
      }
    } else {
      console.log('ℹ️ Skipping emails - file:', file.name, 'hasSubmissionData:', !!submissionData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          key: result.key,
          size: result.size,
          url: result.url,
        },
        folderId: uploadFolderPath,
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};