import type { APIRoute } from 'astro';
import { uploadToR2, initializeR2 } from '../../lib/r2-storage';
import { sendAdminNotification, sendArtistConfirmation } from '../../lib/email-service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get R2 binding from Cloudflare
    const env = locals.runtime?.env;
    
    if (!env) {
      console.error('Runtime environment not available');
      return new Response(
        JSON.stringify({ error: 'Runtime environment not configured' }),
        { status: 500 }
      );
    }

    const binding = env.freshwax_uploads;
    
    if (!binding) {
      console.error('freshwax_uploads binding not found. Available bindings:', Object.keys(env));
      return new Response(
        JSON.stringify({ error: 'R2 bucket binding not configured' }),
        { status: 500 }
      );
    }

    // Initialize R2 client
    console.log('Binding type:', typeof binding);
    console.log('Binding methods:', binding ? Object.getOwnPropertyNames(Object.getPrototypeOf(binding)) : 'null');
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
      folderPath = parentFolderId;
    } else if (folderName) {
      folderPath = folderName;
      isFirstUpload = true;
    } else if (submissionData) {
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
        // Get account ID from binding if available
        const accountId = binding.account_id || env.R2_ACCOUNT_ID || 'unknown';
        const bucketName = 'freshwax-uploads';
        const folderUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${folderPath}`;
        
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
      }
    }

    return new Response(JSON.stringify({
      ...result,
      folderId: folderPath
    }), { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }),
      { status: 500 }
    );
  }
};