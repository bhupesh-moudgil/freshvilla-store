const Queue = require('bull');
const nodemailer = require('nodemailer');

// Create email queue
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email queue processor
emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed:`, error);
    throw error;
  }
});

// Email queue event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

// Helper function to add email to queue
const sendEmail = async (emailData) => {
  return await emailQueue.add(emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

// Email templates
const emailTemplates = {
  distributorApproval: (distributorName) => ({
    subject: 'Distributor Application Approved',
    html: `
      <h1>Congratulations ${distributorName}!</h1>
      <p>Your distributor application has been approved.</p>
      <p>You can now start listing your products on FreshVilla.</p>
      <a href="${process.env.FRONTEND_URL}/distributor/dashboard">Go to Dashboard</a>
    `,
  }),

  distributorRejection: (distributorName, reason) => ({
    subject: 'Distributor Application Update',
    html: `
      <h1>Hello ${distributorName},</h1>
      <p>We regret to inform you that your distributor application was not approved.</p>
      <p>Reason: ${reason}</p>
      <p>You can reapply after addressing the issues mentioned above.</p>
    `,
  }),

  orderConfirmation: (orderNumber, customerName) => ({
    subject: `Order Confirmation - #${orderNumber}`,
    html: `
      <h1>Thank you for your order, ${customerName}!</h1>
      <p>Order Number: #${orderNumber}</p>
      <p>We'll send you a tracking number once your order ships.</p>
      <a href="${process.env.FRONTEND_URL}/orders/${orderNumber}">Track Order</a>
    `,
  }),

  abandonedCart: (customerName, cartUrl) => ({
    subject: 'You left items in your cart',
    html: `
      <h1>Hi ${customerName},</h1>
      <p>You have items waiting in your cart.</p>
      <p>Complete your purchase before they're gone!</p>
      <a href="${cartUrl}">Complete Purchase</a>
    `,
  }),

  reviewReminder: (customerName, productName) => ({
    subject: 'Share your feedback',
    html: `
      <h1>Hi ${customerName},</h1>
      <p>How was your experience with ${productName}?</p>
      <p>Your feedback helps others make informed decisions.</p>
      <a href="${process.env.FRONTEND_URL}/reviews/write">Write Review</a>
    `,
  }),
};

module.exports = {
  emailQueue,
  sendEmail,
  emailTemplates,
};
