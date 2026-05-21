const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Bridal', description: 'Exquisite bridal sarees for your special day', image: '/uploads/placeholder.png' },
  { name: 'Silk', description: 'Pure silk sarees with timeless elegance', image: '/uploads/placeholder.png' },
  { name: 'Cotton', description: 'Comfortable cotton sarees for everyday wear', image: '/uploads/placeholder.png' },
  { name: 'Festive', description: 'Celebration-ready sarees for festivals and occasions', image: '/uploads/placeholder.png' },
  { name: 'Party Wear', description: 'Stunning party wear sarees that make a statement', image: '/uploads/placeholder.png' },
  { name: 'Casual', description: 'Light and breezy sarees for casual outings', image: '/uploads/placeholder.png' },
  { name: 'Designer', description: 'Handcrafted designer sarees with unique patterns', image: '/uploads/placeholder.png' },
  { name: 'Banarasi', description: 'Traditional Banarasi sarees from Varanasi', image: '/uploads/placeholder.png' },
];

const PRODUCT_DATA = [
  { name: 'Kanjivaram Silk Saree', fabric: 'Silk', occasion: 'Wedding', colors: ['Red', 'Gold', 'Maroon'], category: 'Bridal' },
  { name: 'Banarasi Brocade Saree', fabric: 'Silk', occasion: 'Wedding', colors: ['Maroon', 'Gold', 'Green'], category: 'Banarasi' },
  { name: 'Patola Silk Saree', fabric: 'Silk', occasion: 'Festival', colors: ['Red', 'Green', 'Yellow'], category: 'Silk' },
  { name: 'Chanderi Cotton Saree', fabric: 'Cotton', occasion: 'Casual', colors: ['White', 'Pink', 'Blue'], category: 'Cotton' },
  { name: 'Bandhani Georgette Saree', fabric: 'Georgette', occasion: 'Festival', colors: ['Yellow', 'Orange', 'Pink'], category: 'Festive' },
  { name: 'Embroidered Net Saree', fabric: 'Net', occasion: 'Party', colors: ['Black', 'Navy', 'Purple'], category: 'Party Wear' },
  { name: 'Printed Chiffon Saree', fabric: 'Chiffon', occasion: 'Casual', colors: ['Blue', 'Green', 'Peach'], category: 'Casual' },
  { name: 'Paithani Silk Saree', fabric: 'Silk', occasion: 'Wedding', colors: ['Green', 'Purple', 'Red'], category: 'Bridal' },
  { name: 'Tussar Silk Saree', fabric: 'Silk', occasion: 'Festival', colors: ['Gold', 'Teal', 'Orange'], category: 'Designer' },
  { name: 'Linen Cotton Saree', fabric: 'Linen', occasion: 'Casual', colors: ['White', 'Beige', 'Lavender'], category: 'Cotton' },
  { name: 'Organza Embroidered Saree', fabric: 'Organza', occasion: 'Party', colors: ['Pink', 'Peach', 'Lavender'], category: 'Party Wear' },
  { name: 'Satin Silk Saree', fabric: 'Satin', occasion: 'Wedding', colors: ['Red', 'Maroon', 'Gold'], category: 'Bridal' },
  { name: 'Crepe Printed Saree', fabric: 'Crepe', occasion: 'Casual', colors: ['Blue', 'Green', 'Black'], category: 'Casual' },
  { name: 'Art Silk Zari Saree', fabric: 'Art Silk', occasion: 'Festival', colors: ['Gold', 'Red', 'Green'], category: 'Festive' },
  { name: 'Digital Print Georgette', fabric: 'Georgette', occasion: 'Party', colors: ['Blue', 'Pink', 'Teal'], category: 'Party Wear' },
  { name: 'Handloom Cotton Saree', fabric: 'Cotton', occasion: 'Casual', colors: ['White', 'Yellow', 'Green'], category: 'Cotton' },
  { name: 'Bridal Red Silk Saree', fabric: 'Silk', occasion: 'Wedding', colors: ['Red', 'Gold'], category: 'Bridal' },
  { name: 'Pastel Chiffon Saree', fabric: 'Chiffon', occasion: 'Engagement', colors: ['Peach', 'Lavender', 'Pink'], category: 'Designer' },
  { name: 'Mirror Work Gharchola', fabric: 'Silk', occasion: 'Wedding', colors: ['Red', 'White', 'Gold'], category: 'Bridal' },
  { name: 'Ikat Cotton Saree', fabric: 'Cotton', occasion: 'Festival', colors: ['Black', 'Red', 'Yellow'], category: 'Festive' },
  { name: 'Sequin Net Party Saree', fabric: 'Net', occasion: 'Party', colors: ['Gold', 'Silver', 'Black'], category: 'Party Wear' },
  { name: 'Block Print Cotton Saree', fabric: 'Cotton', occasion: 'Casual', colors: ['Blue', 'Green', 'Red'], category: 'Cotton' },
  { name: 'Zari Border Silk Saree', fabric: 'Silk', occasion: 'Festival', colors: ['Maroon', 'Gold', 'Green'], category: 'Banarasi' },
  { name: 'Floral Print Crepe Saree', fabric: 'Crepe', occasion: 'Casual', colors: ['Pink', 'Blue', 'White'], category: 'Casual' },
  { name: 'Temple Border Cotton', fabric: 'Cotton', occasion: 'Festival', colors: ['White', 'Gold', 'Red'], category: 'Banarasi' },
];

const PRODUCT_DESCRIPTIONS = [
  'Handcrafted with intricate detailing, this exquisite saree is perfect for special occasions. Made with premium quality fabric and adorned with beautiful patterns.',
  'A timeless classic that combines traditional craftsmanship with modern elegance. Features rich colors and detailed borders.',
  'Lightweight and comfortable, this saree is ideal for all-day wear. The vibrant colors and elegant drape make it a wardrobe essential.',
  'Beautifully woven with traditional motifs, this saree showcases the rich heritage of Indian textile artistry.',
  'A stunning piece featuring detailed embroidery and embellishments. Perfect for making a statement at any celebration.',
];

const REVIEW_TEXTS = [
  'Absolutely beautiful saree! The quality is amazing and the color is exactly as shown. Perfect for my sister\'s wedding.',
  'Very comfortable to wear the whole day. The fabric is soft and the draping is elegant. Highly recommended!',
  'Got so many compliments at the party. The embroidery work is stunning and the price is very reasonable.',
  'Good quality for the price. The color is slightly different from the picture but still very pretty.',
  'Fast delivery and excellent packaging. The saree is even better than expected. Will definitely order again!',
  'Perfect festive wear. The zari work is beautiful and the saree feels premium. Worth every penny.',
];

async function main() {
  console.log('Seeding database...');

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (!existingAdmin) {
    console.log('ERROR: No admin user found. Please create an admin user first.');
    process.exit(1);
  }
  console.log('Using existing admin user:', existingAdmin.email);

  await prisma.address.deleteMany();
  await prisma.user.deleteMany({ where: { isAdmin: false } });
  await prisma.newsletter.deleteMany();

  console.log('Creating test users...');
  const userData = [
    { email: 'priya.sharma@email.com', firstName: 'Priya', lastName: 'Sharma', phone: '9876543211',
      addresses: [{ streetAddress: '123 Ring Road', city: 'Surat', state: 'Gujarat', zipCode: '395002', label: 'Home', isDefault: true }] },
    { email: 'anita.patel@email.com', firstName: 'Anita', lastName: 'Patel', phone: '9876543212',
      addresses: [{ streetAddress: '456 CG Road', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380006', label: 'Home', isDefault: true }] },
    { email: 'kavita.desai@email.com', firstName: 'Kavita', lastName: 'Desai', phone: '9876543213',
      addresses: [{ streetAddress: '789 SG Highway', city: 'Vadodara', state: 'Gujarat', zipCode: '390001', label: 'Home', isDefault: true }] },
    { email: 'meera.joshi@email.com', firstName: 'Meera', lastName: 'Joshi', phone: '9876543214', addresses: [] },
    { email: 'sneha.gupta@email.com', firstName: 'Sneha', lastName: 'Gupta', phone: '9876543215',
      addresses: [{ streetAddress: '321 Station Road', city: 'Rajkot', state: 'Gujarat', zipCode: '360001', label: 'Home', isDefault: true }] },
  ];

  const userPassword = process.env.SEED_USER_PASSWORD || 'User@1234';
  const users = [];
  for (const u of userData) {
    const { addresses, ...userFields } = u;
    const user = await prisma.user.create({
      data: {
        ...userFields,
        password: await bcrypt.hash(userPassword, 10),
        addresses: addresses.length > 0 ? { create: addresses } : undefined,
      },
    });
    users.push(user);
  }

  console.log('Creating categories...');
  const categories = [];
  for (const cat of CATEGORIES) {
    const c = await prisma.category.create({ data: cat });
    categories.push(c);
  }
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.name] = c; });

  console.log('Creating products...');
  const products = [];
  for (let i = 0; i < PRODUCT_DATA.length; i++) {
    const item = PRODUCT_DATA[i];
    const color = item.colors[i % item.colors.length];
    const category = categoryMap[item.category];
    const price = Math.floor(Math.random() * 15000) + 1500;
    const mrp = price + Math.floor(Math.random() * 5000) + 1000;
    const stock = Math.floor(Math.random() * 20) + 3;

    const product = await prisma.product.create({
      data: {
        name: `${item.name} - ${color}`,
        description: PRODUCT_DESCRIPTIONS[i % PRODUCT_DESCRIPTIONS.length],
        color,
        fabric: item.fabric,
        occasion: item.occasion,
        price,
        mrp,
        stock,
        images: ['/uploads/placeholder.png'],
        categoryId: category.id,
        userId: existingAdmin.id,
      },
    });
    products.push(product);
  }

  console.log('Creating orders...');
  const orderStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  for (let i = 0; i < 8; i++) {
    const user = users[i % users.length];
    const status = orderStatuses[i % orderStatuses.length];
    const itemCount = Math.floor(Math.random() * 2) + 1;
    const selectedProducts = products.slice(i * 2, i * 2 + itemCount);
    const deliveryCharge = 80;

    let totalAmount = 0;
    const orderItemsData = selectedProducts.map(p => {
      const qty = Math.floor(Math.random() * 2) + 1;
      totalAmount += p.price * qty;
      const itemStatus = status === 'DELIVERED' ? 'DELIVERED' : status === 'SHIPPED' ? 'SHIPPED' : 'PENDING';
      return {
        productId: p.id,
        productName: p.name,
        productImage: p.images[0],
        price: p.price,
        quantity: qty,
        withPolish: false,
        isReturnable: status === 'DELIVERED',
        status: itemStatus,
      };
    });

    const userAddresses = await prisma.address.findMany({ where: { userId: user.id } });
    const addr = userAddresses[0];
    const shippingAddress = addr
      ? `${addr.streetAddress}, ${addr.city}, ${addr.state} - ${addr.zipCode}, India`
      : 'Default Address, Surat, Gujarat - 395001, India';

    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: totalAmount + deliveryCharge,
        deliveryCharge,
        status,
        shippingAddress,
        orderItems: { create: orderItemsData },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Creating reviews...');
  for (let i = 0; i < 6; i++) {
    const user = users[i % users.length];
    const product = products[i % 10];
    await prisma.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4,
        title: ['Beautiful!', 'Love it!', 'Great quality', 'Worth it!', 'Stunning!', 'Excellent!'][i],
        text: REVIEW_TEXTS[i],
        images: [],
        isApproved: true,
      },
    });
  }

  console.log('Creating newsletter subscribers...');
  await prisma.newsletter.createMany({
    data: [
      { email: 'newsletter1@example.com' },
      { email: 'newsletter2@example.com' },
      { email: 'newsletter3@example.com' },
      { email: 'newsletter4@example.com' },
      { email: 'newsletter5@example.com' },
    ],
  });

  console.log('');
  console.log('Database seeded successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Test Users: ${users.length}`);
  console.log(`  Admin: ${existingAdmin.email} (existing, not modified)`);
  console.log('');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
