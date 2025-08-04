// Email templates for different purposes

function getOrderConfirmationTemplate(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
        ${item.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmation - Order #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Everything Maternity</h1>
          <h2 style="color: #666; margin: 10px 0 0 0;">Order Confirmation</h2>
        </header>
        
        <div style="padding: 20px;">
          <p>Dear ${order.shipping?.firstName || 'Customer'},</p>
          <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">
                  Total:
                </td>
                <td style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">
                  $${order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          ${order.shipping ? `
          <h3>Shipping Address:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <p>${order.shipping.firstName} ${order.shipping.lastName}</p>
            <p>${order.shipping.address}</p>
            <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}</p>
            ${order.shipping.country ? `<p>${order.shipping.country}</p>` : ''}
          </div>` : ''}

          <p>You will receive another email with tracking information once your order ships.</p>
          <p>If you have any questions about your order, please contact us at <a href="mailto:${process.env.EMAIL_HOST_USER}">${process.env.EMAIL_HOST_USER}</a></p>
          
          <p>Thank you for shopping with Everything Maternity!</p>
        </div>
        
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 Everything Maternity. All rights reserved.</p>
        </footer>
      </div>
    `,
    text: `
Order Confirmation - Order #${order.id}

Dear ${order.shipping?.firstName || 'Customer'},

Thank you for your order! We've received your order and are preparing it for shipment.

Order Details:
- Order Number: #${order.id}
- Order Date: ${new Date(order.date).toLocaleDateString()}
- Status: ${order.status}
- Total: $${order.total.toFixed(2)}

Items Ordered:
${order.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

${order.shipping ? `
Shipping Address:
${order.shipping.firstName} ${order.shipping.lastName}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
${order.shipping.country || ''}
` : ''}

You will receive another email with tracking information once your order ships.

If you have any questions about your order, please contact us at ${process.env.EMAIL_HOST_USER}

Thank you for shopping with Everything Maternity!
    `
  };
}

function getOrderStatusUpdateTemplate(order, newStatus) {
  return {
    subject: `Order Update - Order #${order.id} is now ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Everything Maternity</h1>
          <h2 style="color: #666; margin: 10px 0 0 0;">Order Update</h2>
        </header>
        
        <div style="padding: 20px;">
          <p>Dear ${order.shipping?.firstName || 'Customer'},</p>
          <p>Your order status has been updated!</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>New Status:</strong> <span style="color: #28a745; font-weight: bold;">${newStatus}</span></p>
            <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${newStatus === 'Shipped' ? `
          <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">Your order is on its way!</h3>
            <p style="margin: 0; color: #155724;">You'll receive tracking information shortly.</p>
          </div>
          ` : ''}

          ${newStatus === 'Delivered' ? `
          <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">Order Delivered!</h3>
            <p style="margin: 0; color: #155724;">We hope you love your purchase! Please consider leaving a review.</p>
          </div>
          ` : ''}

          <p>If you have any questions about your order, please contact us at <a href="mailto:${process.env.EMAIL_HOST_USER}">${process.env.EMAIL_HOST_USER}</a></p>
          
          <p>Thank you for shopping with Everything Maternity!</p>
        </div>
        
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 Everything Maternity. All rights reserved.</p>
        </footer>
      </div>
    `,
    text: `
Order Update - Order #${order.id} is now ${newStatus}

Dear ${order.shipping?.firstName || 'Customer'},

Your order status has been updated!

Order Details:
- Order Number: #${order.id}
- New Status: ${newStatus}
- Updated: ${new Date().toLocaleDateString()}

${newStatus === 'Shipped' ? 'Your order is on its way! You\'ll receive tracking information shortly.' : ''}
${newStatus === 'Delivered' ? 'Order Delivered! We hope you love your purchase! Please consider leaving a review.' : ''}

If you have any questions about your order, please contact us at ${process.env.EMAIL_HOST_USER}

Thank you for shopping with Everything Maternity!
    `
  };
}

function getContactFormTemplate(contactData) {
  return {
    subject: `New Contact Form Submission from ${contactData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Everything Maternity</h1>
          <h2 style="color: #666; margin: 10px 0 0 0;">New Contact Form Submission</h2>
        </header>
        
        <div style="padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
            ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="background-color: #fff; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #ddd;">
            <h3 style="margin: 0 0 15px 0;">Message</h3>
            <p style="white-space: pre-wrap;">${contactData.message}</p>
          </div>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission from ${contactData.name}

Contact Information:
- Name: ${contactData.name}
- Email: ${contactData.email}
${contactData.phone ? `- Phone: ${contactData.phone}` : ''}
${contactData.subject ? `- Subject: ${contactData.subject}` : ''}
- Date: ${new Date().toLocaleDateString()}

Message:
${contactData.message}
    `
  };
}

function getWelcomeEmailTemplate(user) {
  return {
    subject: 'Welcome to Everything Maternity!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Everything Maternity</h1>
          <h2 style="color: #666; margin: 10px 0 0 0;">Welcome!</h2>
        </header>
        
        <div style="padding: 20px;">
          <p>Dear ${user.name},</p>
          <p>Welcome to Everything Maternity! We're thrilled to have you join our community of expecting and new mothers.</p>
          
          <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">Your account is ready!</h3>
            <p style="margin: 0; color: #155724;">You can now browse our full collection and enjoy exclusive member benefits.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Shopping
            </a>
          </div>

          <p>What's next?</p>
          <ul>
            <li>Browse our latest maternity fashion</li>
            <li>Sign up for our newsletter for exclusive deals</li>
            <li>Follow us on social media for style inspiration</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:${process.env.EMAIL_HOST_USER}">${process.env.EMAIL_HOST_USER}</a></p>
          
          <p>Happy shopping!</p>
          <p>The Everything Maternity Team</p>
        </div>
        
        <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 Everything Maternity. All rights reserved.</p>
        </footer>
      </div>
    `,
    text: `
Welcome to Everything Maternity!

Dear ${user.name},

Welcome to Everything Maternity! We're thrilled to have you join our community of expecting and new mothers.

Your account is ready! You can now browse our full collection and enjoy exclusive member benefits.

What's next?
- Browse our latest maternity fashion
- Sign up for our newsletter for exclusive deals
- Follow us on social media for style inspiration

If you have any questions, please don't hesitate to contact us at ${process.env.EMAIL_HOST_USER}

Happy shopping!
The Everything Maternity Team
    `
  };
}

module.exports = {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
  getContactFormTemplate,
  getWelcomeEmailTemplate,
};
