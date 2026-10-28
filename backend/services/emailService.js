const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'HotelPro Concierge <no-reply@hotelpro.com>';

  if (!transporter) {
    console.log(`[Email Service - Dev Mode]: Email not dispatched (SMTP unconfigured).`);
    console.log(`To: ${to} | Subject: ${subject}`);
    return { dispatched: false, reason: 'SMTP credentials not configured in environment' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html,
    });
    console.log(`[Email Service]: Message sent ${info.messageId}`);
    return { dispatched: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error]: ${error.message}`);
    return { dispatched: false, error: error.message };
  }
};

const templates = {
  bookingConfirmation: (booking, hotel, room) => ({
    subject: `Booking Confirmed: #${booking.bookingReference} - ${hotel.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf9f5; border: 1px solid #e5dfd3; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #c5a880; padding-bottom: 16px;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 26px; letter-spacing: 1px;">HOTELPRO</h1>
          <p style="color: #c5a880; font-size: 13px; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 2px;">Experience Luxury. Stay Exceptional.</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #2b2b2b; font-size: 20px;">Reservation Confirmed!</h2>
          <p style="color: #555; line-height: 1.6;">Dear ${booking.guestDetails.name}, thank you for choosing <strong>${hotel.name}</strong>. Your reservation is confirmed.</p>
          <div style="background: #ffffff; border-radius: 6px; padding: 18px; margin: 20px 0; border: 1px solid #eaeaea;">
            <p style="margin: 6px 0;"><strong>Booking Reference:</strong> <span style="color: #c5a880; font-size: 18px; font-weight: bold;">#${booking.bookingReference}</span></p>
            <p style="margin: 6px 0;"><strong>Hotel:</strong> ${hotel.name} (${hotel.city})</p>
            <p style="margin: 6px 0;"><strong>Room:</strong> Room #${room.roomNumber}</p>
            <p style="margin: 6px 0;"><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()} (${hotel.policies.checkInTime})</p>
            <p style="margin: 6px 0;"><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} (${hotel.policies.checkOutTime})</p>
            <p style="margin: 6px 0;"><strong>Guests:</strong> ${booking.guestCount.adults} Adults${booking.guestCount.children ? `, ${booking.guestCount.children} Children` : ''}</p>
            <p style="margin: 6px 0;"><strong>Total Paid:</strong> ₹${booking.pricing.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <p style="color: #777; font-size: 13px;">Please present this confirmation email or booking ID upon arrival at the reception desk.</p>
        </div>
        <div style="border-top: 1px solid #e5dfd3; padding-top: 16px; text-align: center; color: #999; font-size: 12px;">
          <p>HotelPro Luxury Residences & Resorts • ${hotel.address}, ${hotel.city}</p>
          <p>Need assistance? Contact us at ${hotel.contactDetails.phone} or ${hotel.contactDetails.email}</p>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (booking, payment) => ({
    subject: `Payment Receipt: ₹${payment.amount} for Booking #${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2b2b2b;">Payment Successful</h2>
        <p>Dear ${booking.guestDetails.name},</p>
        <p>We have successfully received your payment of <strong>₹${payment.amount.toLocaleString('en-IN')}</strong> for reservation <strong>#${booking.bookingReference}</strong>.</p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${payment.providerPaymentId || payment._id}</p>
          <p style="margin: 4px 0;"><strong>Payment Gateway:</strong> ${payment.provider.toUpperCase()}</p>
          <p style="margin: 4px 0;"><strong>Amount Paid:</strong> ₹${payment.amount.toLocaleString('en-IN')}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>You can access your complete tax invoice from your HotelPro guest dashboard at any time.</p>
      </div>
    `,
  }),

  bookingCancellation: (booking, refundAmount) => ({
    subject: `Booking Cancelled: #${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #c0392b;">Reservation Cancellation</h2>
        <p>Dear ${booking.guestDetails.name},</p>
        <p>Your reservation <strong>#${booking.bookingReference}</strong> has been cancelled as per your request.</p>
        ${
          refundAmount > 0
            ? `<p>A refund of <strong>₹${refundAmount.toLocaleString('en-IN')}</strong> has been processed according to hotel cancellation policies.</p>`
            : `<p>As per the hotel cancellation policy, this reservation is non-refundable or outside the refundable window.</p>`
        }
        <p>We hope to welcome you to HotelPro on another occasion.</p>
      </div>
    `,
  }),

  welcomeGuest: (user) => ({
    subject: 'Welcome to HotelPro Hospitality',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #1a1a1a;">Welcome to HotelPro, ${user.name}!</h2>
        <p>Thank you for creating your account. Discover extraordinary luxury stays, customized services, and seamless reservations with HotelPro.</p>
        <p>Sign in at any time to explore our curated hotel rooms and suites.</p>
      </div>
    `,
  }),

  passwordReset: (user, resetUrl) => ({
    subject: 'Password Reset Request - HotelPro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2>Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You requested to reset your password. Please click the link below to set a new password. This link is valid for 10 minutes.</p>
        <p style="margin: 20px 0;"><a href="${resetUrl}" style="background: #c5a880; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p style="font-size: 12px; color: #888;">If you did not request this, please disregard this email.</p>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  templates,
};
