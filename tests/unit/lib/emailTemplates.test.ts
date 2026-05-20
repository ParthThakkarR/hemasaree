// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('emailTemplates', () => {
  beforeEach(() => { vi.resetModules(); });

  describe('welcomeTemplate', () => {
    it('generates welcome email with name', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('John');
      expect(html).toContain('Hi John');
    });

    it('includes app URL in welcome template', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Jane');
      expect(html).toContain('localhost:3000');
    });

    it('includes Welcome to Hemasaree header', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('Welcome to Hemasaree!');
    });

    it('includes Start Shopping button', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('Start Shopping');
    });

    it('includes copyright with current year', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain(new Date().getFullYear().toString());
    });

    it('includes thank you message', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('Thank you for joining');
    });

    it('includes latest collections message', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('latest collections');
    });

    it('handles empty name', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('');
      expect(html).toContain('Hi ');
    });

    it('handles name with spaces', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('John Doe');
      expect(html).toContain('Hi John Doe');
    });

    it('handles name with special characters', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate("O'Brien");
      expect(html).toContain("Hi O'Brien");
    });

    it('handles name with unicode', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('सारा');
      expect(html).toContain('Hi सारा');
    });

    it('handles name with numbers', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('User123');
      expect(html).toContain('Hi User123');
    });

    it('handles very long name', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const longName = 'A'.repeat(200);
      const html = welcomeTemplate(longName);
      expect(html).toContain(longName);
    });

    it('returns valid HTML structure', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });

    it('includes CSS styles', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('<style>');
      expect(html).toContain('font-family');
    });

    it('includes container div', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('class="container"');
    });

    it('includes header section', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('class="header"');
    });

    it('includes content section', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('class="content"');
    });

    it('includes footer section', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('class="footer"');
    });

    it('includes All rights reserved text', async () => {
      const { welcomeTemplate } = await import('@/lib/email/templates');
      const html = welcomeTemplate('Test');
      expect(html).toContain('All rights reserved');
    });
  });

  describe('orderConfirmationTemplate', () => {
    const mockOrder = {
      id: 'ORD-123',
      totalAmount: 1500,
      user: { name: 'John Doe', firstName: 'John' },
      orderItems: [
        { productName: 'Silk Saree', quantity: 1, price: 1000 },
        { productName: 'Cotton Saree', quantity: 2, price: 250 },
      ],
    };

    it('generates order confirmation with order ID', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('ORD-123');
    });

    it('includes total amount', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('₹1500');
    });

    it('uses user.name when available', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Hi John Doe');
    });

    it('falls back to user.firstName when name not available', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const order = { ...mockOrder, user: { firstName: 'Jane' } };
      const html = orderConfirmationTemplate(order);
      expect(html).toContain('Hi Jane');
    });

    it('includes all order items', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Silk Saree');
      expect(html).toContain('Cotton Saree');
    });

    it('includes item quantities', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('<td>1</td>');
      expect(html).toContain('<td>2</td>');
    });

    it('includes item prices', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('₹1000');
      expect(html).toContain('₹250');
    });

    it('includes Order Confirmation header', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Order Confirmation');
    });

    it('includes Items Ordered heading', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Items Ordered');
    });

    it('includes table structure', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('<table');
      expect(html).toContain('<th>Product</th>');
      expect(html).toContain('<th>Quantity</th>');
      expect(html).toContain('<th>Price</th>');
    });

    it('handles empty order items', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const order = { ...mockOrder, orderItems: [] };
      const html = orderConfirmationTemplate(order);
      expect(html).toContain('Order Confirmation');
    });

    it('handles single order item', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const order = { ...mockOrder, orderItems: [{ productName: 'Single Item', quantity: 1, price: 500 }] };
      const html = orderConfirmationTemplate(order);
      expect(html).toContain('Single Item');
    });

    it('handles many order items', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const items = Array.from({ length: 20 }, (_, i) => ({ productName: `Item ${i}`, quantity: 1, price: 100 }));
      const order = { ...mockOrder, orderItems: items };
      const html = orderConfirmationTemplate(order);
      items.forEach(item => expect(html).toContain(item.productName));
    });

    it('includes thank you message', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Thank you for your order');
    });

    it('includes processing message', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('processing');
    });

    it('includes copyright', async () => {
      const { orderConfirmationTemplate } = await import('@/lib/email/templates');
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain(new Date().getFullYear().toString());
    });
  });

  describe('orderShippedTemplate', () => {
    const mockOrder = { id: 'ORD-456', user: { name: 'Jane', firstName: 'Jane' } };

    it('includes order ID', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('ORD-456');
    });

    it('includes tracking info', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('TRACK-789');
    });

    it('includes shipped header', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('Your Order has Shipped!');
    });

    it('includes on its way message', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('on its way');
    });

    it('uses user name', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('Hi Jane');
    });

    it('handles empty tracking info', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, '');
      expect(html).toContain('ORD-456');
    });

    it('handles long tracking info', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const longTracking = 'TRACK-' + 'X'.repeat(100);
      const html = orderShippedTemplate(mockOrder, longTracking);
      expect(html).toContain(longTracking);
    });

    it('includes Great news message', async () => {
      const { orderShippedTemplate } = await import('@/lib/email/templates');
      const html = orderShippedTemplate(mockOrder, 'TRACK-789');
      expect(html).toContain('Great news');
    });
  });

  describe('orderDeliveredTemplate', () => {
    const mockOrder = { id: 'ORD-789', user: { name: 'Bob', firstName: 'Bob' } };

    it('includes order ID', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('ORD-789');
    });

    it('includes delivered header', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('Your Order has been Delivered!');
    });

    it('includes hope you love message', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('hope you love');
    });

    it('includes return within 7 days message', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('7 days');
    });

    it('uses user name', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('Hi Bob');
    });

    it('includes delivered successfully message', async () => {
      const { orderDeliveredTemplate } = await import('@/lib/email/templates');
      const html = orderDeliveredTemplate(mockOrder);
      expect(html).toContain('delivered successfully');
    });
  });

  describe('returnRequestedTemplate', () => {
    it('includes admin name', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', 'Defective');
      expect(html).toContain('Hi Admin');
    });

    it('includes order ID', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', 'Defective');
      expect(html).toContain('ORD-100');
    });

    it('includes reason', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', 'Wrong size');
      expect(html).toContain('Wrong size');
    });

    it('includes return request header', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', 'Defective');
      expect(html).toContain('New Return Request');
    });

    it('includes review in admin panel message', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', 'Defective');
      expect(html).toContain('admin panel');
    });

    it('handles empty reason', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const html = returnRequestedTemplate('Admin', 'ORD-100', '');
      expect(html).toContain('ORD-100');
    });

    it('handles long reason', async () => {
      const { returnRequestedTemplate } = await import('@/lib/email/templates');
      const longReason = 'A'.repeat(500);
      const html = returnRequestedTemplate('Admin', 'ORD-100', longReason);
      expect(html).toContain(longReason);
    });
  });

  describe('returnStatusTemplate', () => {
    it('includes user name for APPROVED', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'APPROVED');
      expect(html).toContain('Hi User');
    });

    it('includes order ID', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'APPROVED');
      expect(html).toContain('ORD-200');
    });

    it('includes APPROVED status', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'APPROVED');
      expect(html).toContain('APPROVED');
    });

    it('includes REJECTED status', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'REJECTED');
      expect(html).toContain('REJECTED');
    });

    it('includes team will contact message for APPROVED', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'APPROVED');
      expect(html).toContain('contact you soon');
    });

    it('includes contact support message for REJECTED', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('User', 'ORD-200', 'REJECTED');
      expect(html).toContain('contact our support');
    });

    it('handles empty name', async () => {
      const { returnStatusTemplate } = await import('@/lib/email/templates');
      const html = returnStatusTemplate('', 'ORD-200', 'APPROVED');
      expect(html).toContain('Hi ');
    });
  });

  describe('newsletterTemplate', () => {
    it('includes content', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('<h1>News</h1>');
      expect(html).toContain('<h1>News</h1>');
    });

    it('includes newsletter header', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('Content');
      expect(html).toContain('Hemasaree Newsletter');
    });

    it('includes subscribed message', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('Content');
      expect(html).toContain('subscribed to our newsletter');
    });

    it('includes copyright', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('Content');
      expect(html).toContain(new Date().getFullYear().toString());
    });

    it('handles empty content', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('');
      expect(html).toContain('Hemasaree Newsletter');
    });

    it('handles HTML content', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const content = '<div><h2>Sale</h2><p>50% off</p></div>';
      const html = newsletterTemplate(content);
      expect(html).toContain('<h2>Sale</h2>');
    });

    it('handles plain text content', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const html = newsletterTemplate('Plain text newsletter');
      expect(html).toContain('Plain text newsletter');
    });

    it('handles very long content', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const longContent = 'A'.repeat(10000);
      const html = newsletterTemplate(longContent);
      expect(html).toContain(longContent);
    });

    it('handles content with images', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const content = '<img src="https://example.com/banner.jpg">';
      const html = newsletterTemplate(content);
      expect(html).toContain('banner.jpg');
    });

    it('handles content with links', async () => {
      const { newsletterTemplate } = await import('@/lib/email/templates');
      const content = '<a href="https://example.com/sale">Shop Now</a>';
      const html = newsletterTemplate(content);
      expect(html).toContain('Shop Now');
    });
  });
});
