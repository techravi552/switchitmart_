const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If no email config, use ethereal (test) transport
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your@gmail.com') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, auth: { user: 'test@ethereal.email', pass: 'test' },
    });
  }
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'LocalKart <no-reply@localkart.com>',
      to, subject, html, text,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

const emailTemplates = {
  orderPlaced: (buyerName, productName, total) => ({
    subject: '🛒 Order Placed Successfully - LocalKart',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Your order for <strong>${productName}</strong> has been placed successfully!</p>
      <p>Total: <strong>₹${total}</strong></p>
      <p>You'll be notified once the seller accepts your order.</p>
      <p style="color:#999;font-size:12px">LocalKart — Shop Local, Delivered Fast</p>
    </div>`,
  }),
  orderAccepted: (buyerName, productName, total) => ({
    subject: '✅ Seller Accepted Your Order - LocalKart',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Great news! Your order for <strong>${productName}</strong> has been accepted.</p>
      <p>Total to pay: <strong>₹${total}</strong></p>
      <p>Please login to confirm or reject the order.</p>
    </div>`,
  }),
  orderDelivered: (buyerName, productName) => ({
    subject: '📦 Order Delivered - LocalKart',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Your order for <strong>${productName}</strong> has been delivered!</p>
      <p>Enjoy your purchase. Don't forget to leave a review!</p>
    </div>`,
  }),
  subscriptionExpiring: (sellerName, planName, daysLeft) => ({
    subject: `⚠️ Subscription Expiring in ${daysLeft} days - LocalKart`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${sellerName}</strong>,</p>
      <p>Your <strong>${planName}</strong> subscription expires in <strong>${daysLeft} days</strong>.</p>
      <p>Renew now to keep adding products.</p>
    </div>`,
  }),
  newMessage: (recipientName, senderName) => ({
    subject: `💬 New message from ${senderName} - LocalKart`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${recipientName}</strong>,</p>
      <p>You have a new message from <strong>${senderName}</strong>.</p>
      <p>Login to view and reply.</p>
    </div>`,
  }),
  ticketReply: (name, subject) => ({
    subject: `💬 Reply on your ticket: ${subject} - LocalKart`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#f97316">LocalKart</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>There's a new reply on your support ticket: <strong>${subject}</strong>.</p>
      <p>Login to view the full conversation.</p>
    </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
