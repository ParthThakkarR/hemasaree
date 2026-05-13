export const welcomeTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Hemasaree!</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for joining Hemasaree. We're excited to have you with us!</p>
            <p>Explore our latest collections of beautiful sarees and more.</p>
            <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Start Shopping</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const orderConfirmationTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
        .order-details { margin-top: 20px; border-collapse: collapse; width: 100%; }
        .order-details th, .order-details td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <p>Hi ${order.user.name || order.user.firstName},</p>
            <p>Thank you for your order! We've received your request and are processing it.</p>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            
            <h3>Items Ordered:</h3>
            <table class="order-details">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map((item: any) => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const orderShippedTemplate = (order: any, trackingInfo: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Order has Shipped!</h1>
        </div>
        <div class="content">
            <p>Hi ${order.user.name || order.user.firstName},</p>
            <p>Great news! Your order <strong>${order.id}</strong> is on its way.</p>
            <p><strong>Tracking Information:</strong> ${trackingInfo}</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const orderDeliveredTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Order has been Delivered!</h1>
        </div>
        <div class="content">
            <p>Hi ${order.user.name || order.user.firstName},</p>
            <p>Your order <strong>${order.id}</strong> has been delivered successfully.</p>
            <p>We hope you love your purchase! If you have any issues, you can request a return within 7 days.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const returnRequestedTemplate = (adminName: string, orderId: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Return Request</h1>
        </div>
        <div class="content">
            <p>Hi ${adminName},</p>
            <p>A new return request has been submitted for order <strong>${orderId}</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Please review the request in the admin panel.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const returnStatusTemplate = (name: string, orderId: string, status: 'APPROVED' | 'REJECTED') => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Return Request ${status}</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Your return request for order <strong>${orderId}</strong> has been <strong>${status}</strong>.</p>
            ${status === 'APPROVED' ? '<p>Our team will contact you soon for the next steps.</p>' : '<p>If you have any questions, please contact our support.</p>'}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const newsletterTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
        .header { background: #f8f8f8; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hemasaree Newsletter</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hemasaree. All rights reserved.</p>
            <p>You are receiving this because you subscribed to our newsletter.</p>
        </div>
    </div>
</body>
</html>
`;
