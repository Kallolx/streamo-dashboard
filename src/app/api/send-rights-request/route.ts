import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Google SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App password, not your regular Gmail password
  },
});

// Define destination email where rights management requests will be sent
const RIGHTS_MANAGEMENT_EMAIL = process.env.RIGHTS_MANAGEMENT_EMAIL || 'rights@yourdomain.com';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.requestType || !data.platform || !data.email || !data.labelName || !data.linkUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Format request type to be more readable
    const formattedRequestType = data.requestType === 'whitelist' 
      ? 'Whitelist Request' 
      : 'Claim Release Request';
    
    // Format platform to be more readable
    let formattedPlatform = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
    if (formattedPlatform === 'Youtube') formattedPlatform = 'YouTube';
    
    // Create email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: RIGHTS_MANAGEMENT_EMAIL,
      subject: `${formattedRequestType} for ${data.labelName}`,
      html: `
        <h2>${formattedRequestType}</h2>
        <p><strong>Platform:</strong> ${formattedPlatform}</p>
        <p><strong>Label Name:</strong> ${data.labelName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Content Link:</strong> <a href="${data.linkUrl}" target="_blank">${data.linkUrl}</a></p>
        <hr/>
        <p><em>This request was submitted through the Rights Management dashboard.</em></p>
      `,
      // You can also add a text version of the email for clients that don't support HTML
      text: `
        ${formattedRequestType}
        
        Platform: ${formattedPlatform}
        Label Name: ${data.labelName}
        Email: ${data.email}
        Content Link: ${data.linkUrl}
        
        This request was submitted through the Rights Management dashboard.
      `,
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 