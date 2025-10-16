import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = import.meta.env.NOTIFICATION_EMAIL;
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@freshwax.co.uk';

if (!RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(RESEND_API_KEY);

interface SubmissionData {
  artistName: string;
  labelName?: string;
  email: string;
  releaseName: string;
  trackListing?: string;
  genre: string;
  customGenre?: string;
  notes?: string;
  releaseDateType: string;
  releaseDate?: string;
  vinylRelease: boolean;
  vinylPrice?: string;
  pricePerSale: string;
  folderUrl?: string;
}

// Email to store owner (you)
export async function sendAdminNotification(data: SubmissionData) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1f2937; }
          .value { color: #4b5563; margin-left: 10px; }
          .divider { border-top: 2px solid #e5e7eb; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎵 New Release Submission</h1>
          </div>
          <div class="content">
            <h2>Artist Information</h2>
            <div class="field">
              <span class="label">Artist Name:</span>
              <span class="value">${data.artistName}</span>
            </div>
            ${data.labelName ? `
            <div class="field">
              <span class="label">Label:</span>
              <span class="value">${data.labelName}</span>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${data.email}</span>
            </div>

            <div class="divider"></div>

            <h2>Release Details</h2>
            <div class="field">
              <span class="label">Release Title:</span>
              <span class="value">${data.releaseName}</span>
            </div>
            ${data.trackListing ? `
            <div class="field">
              <span class="label">Track Listing:</span>
              <pre style="background: white; padding: 10px; border-radius: 4px; margin-left: 10px;">${data.trackListing}</pre>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">Genre:</span>
              <span class="value">${data.customGenre || data.genre}</span>
            </div>

            <div class="divider"></div>

            <h2>Pricing</h2>
            <div class="field">
              <span class="label">Digital Price:</span>
              <span class="value">£${data.pricePerSale}</span>
            </div>
            ${data.vinylRelease ? `
            <div class="field">
              <span class="label">Vinyl Release:</span>
              <span class="value">Yes - £${data.vinylPrice}</span>
            </div>
            ` : ''}

            <div class="divider"></div>

            <h2>Release Date</h2>
            <div class="field">
              <span class="label">Preferred Release:</span>
              <span class="value">${data.releaseDateType === 'asap' ? 'As Soon As Possible' : new Date(data.releaseDate!).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            ${data.notes ? `
            <div class="divider"></div>
            <h2>Additional Notes</h2>
            <div style="background: white; padding: 15px; border-radius: 4px;">
              ${data.notes}
            </div>
            ` : ''}

            ${data.folderUrl ? `
            <div class="divider"></div>
            <a href="${data.folderUrl}" class="button">View Files in Storage →</a>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: `🎵 New Submission: ${data.artistName} - ${data.releaseName}`,
      html: emailHtml,
    });

    console.log('Admin notification sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email to artist (confirmation)
export async function sendArtistConfirmation(data: SubmissionData) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .summary { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #1f2937; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1 style="margin: 0;">Submission Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.artistName},</p>
            <p>Thank you for submitting your release <strong>${data.releaseName}</strong> to Fresh Wax!</p>
            
            <div class="summary">
              <h3 style="margin-top: 0;">Submission Summary</h3>
              <div class="field">
                <span class="label">Release:</span> ${data.releaseName}
              </div>
              <div class="field">
                <span class="label">Genre:</span> ${data.customGenre || data.genre}
              </div>
              <div class="field">
                <span class="label">Digital Price:</span> £${data.pricePerSale}
              </div>
              ${data.vinylRelease ? `
              <div class="field">
                <span class="label">Vinyl Price:</span> £${data.vinylPrice}
              </div>
              ` : ''}
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We'll review your submission and uploaded files</li>
              <li>We'll contact you if we need any additional information</li>
              <li>Once approved, your release will be added to the store</li>
            </ul>

            <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:contact@freshwax.co.uk"></a></p>

            <div class="footer">
              <p>Good luck with your release! 🎵</p>
              <p style="font-size: 12px; margin-top: 20px;">freshwax.co.uk - Jungle & Drum and Bass</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `✅ Submission Received - ${data.releaseName}`,
      html: emailHtml,
    });

    console.log('Artist confirmation sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send artist confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}