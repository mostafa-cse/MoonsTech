import nodemailer from "nodemailer";

// In a real application, you would use env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "test@example.com",
    pass: process.env.SMTP_PASS || "password123",
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: SendMailOptions) => {
  // If SMTP is not configured, we'll just log it to the console for demonstration
  if (!process.env.SMTP_HOST) {
    console.log("================ MOCK EMAIL SENT ================");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML: \n${options.html.substring(0, 500)}...\n`);
    console.log("=================================================");
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: '"TechHaven" <noreply@techhaven.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

export const getOrderConfirmationEmailHtml = (order: any, items: any[]) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5; text-align: center;">Order Confirmed!</h1>
      <p>Thank you for your order, <strong>${order.orderNumber}</strong>.</p>
      <p>We have received your order and are processing it right now.</p>
      <h2 style="color: #111827;">Order Details</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
            <th style="padding: 10px 0;">Item</th>
            <th style="padding: 10px 0;">Qty</th>
            <th style="padding: 10px 0;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0;">${item.productName}</td>
              <td style="padding: 10px 0;">${item.quantity}</td>
              <td style="padding: 10px 0;">৳${Number(item.totalPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px 0; font-weight: bold; text-align: right;">Total:</td>
            <td style="padding: 10px 0; font-weight: bold;">৳${Number(order.total).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      <p style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:5173/track" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Order</a>
      </p>
    </div>
  `;
};

export const getOrderStatusEmailHtml = (order: any) => {
  const statusMap: Record<string, string> = {
    confirmed: "Confirmed",
    processing: "Processing",
    ready_to_ship: "Ready to Ship",
    handover_to_delivery: "Handed to Courier",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  
  const displayStatus = statusMap[order.status] || order.status;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5; text-align: center;">Order Status Update</h1>
      <p>Hello!</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been updated to: <strong>${displayStatus}</strong>.</p>
      <p>You can track the progress of your order using our order tracking tool.</p>
      <p style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:5173/track" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Order</a>
      </p>
    </div>
  `;
};
