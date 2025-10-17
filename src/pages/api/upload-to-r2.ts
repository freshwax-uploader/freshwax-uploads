import type { APIRoute } from 'astro';
import { uploadToR2, initializeR2 } from '../../lib/r2-storage';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('Upload API called');
    
    const binding = locals?.runtime?.env?.MY_BUCKET;
    const env = locals?.runtime?.env;
    
    console.log('Environment available:', !!env);
    console.log('Binding:', binding ? 'exists' : 'missing');
    
    initializeR2(binding, env);
    console.log('R2 initialized');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderName = formData.get('folderName') as string | null;
    const parentFolderId = formData.get('parentFolderId') as string | null;
    const submissionData = formData.get('submissionData') as string | null;

    console.log('File:', file?.name);
    console.log('FolderName:', folderName);
    console.log('ParentFolderId:', parentFolderId);

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert to Uint8Array instead of Buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('File size:', uint8Array.length);

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

    console.log('FolderPath:', folderPath);
    console.log('IsFirstUpload:', isFirstUpload);

    const result = await uploadToR2({
      filename: file.name,
      buffer: uint8Array,
      contentType: file.type,
      folderPath: folderPath || undefined,
    });

    console.log('Upload result:', result);

    if (!result.success) {
      return new Response(JSON.stringify(result), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (isFirstUpload && submissionData) {
      try {
        console.log('Sending emails...');
        const data = JSON.parse(submissionData);
        await sendEmails(data, folderPath, env);
        console.log('Emails sent');
      } catch (emailError) {
        console.error('Email error (non-critical):', emailError);
      }
    }

    return new Response(JSON.stringify({
      ...result,
      folderId: folderPath
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error stack:', errorStack);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

async function sendEmails(data: any, folderPath: string, env: any) {
  const resendApiKey = env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  const fromEmail = env?.FROM_EMAIL || import.meta.env.FROM_EMAIL;
  const notificationEmail = env?.NOTIFICATION_EMAIL || import.meta.env.NOTIFICATION_EMAIL;

  console.log('Email config check:', {
    hasApiKey: !!resendApiKey,
    fromEmail,
    notificationEmail
  });

  if (!resendApiKey) {
    console.log('No Resend API key, skipping emails');
    return;
  }

  try {
    console.log('Sending admin email...');
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: `🎵 New Submission: ${data.artistName} - ${data.releaseName}`,
        html: `
          <h2>New Release Submission</h2>
          <p><strong>Artist:</strong> ${data.artistName}</p>
          <p><strong>Release:</strong> ${data.releaseName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Genre:</strong> ${data.customGenre || data.genre}</p>
          <p><strong>Price:</strong> £${data.pricePerSale}</p>
          ${data.vinylRelease ? `<p><strong>Vinyl Price:</strong> £${data.vinylPrice}</p>` : ''}
          <p><strong>Folder:</strong> ${folderPath}</p>
        `,
      }),
    });
    console.log('Admin email sent');

    console.log('Sending artist email...');
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: data.email,
        subject: `✅ Submission Received - ${data.releaseName}`,
        html: `
          <h2>Submission Received!</h2>
          <p>Hi ${data.artistName},</p>
          <p>Thank you for submitting <strong>${data.releaseName}</strong> to Fresh Wax!</p>
          <p>We'll review your submission and get back to you soon.</p>
          <p>Good luck with your release! 🎵</p>
        `,
      }),
    });
    console.log('Artist email sent');
  } catch (error) {
    console.error('Failed to send emails:', error);
  }
}