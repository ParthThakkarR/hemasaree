export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  date: string;
  readTime: string;
  category: string;
  content: string; // HTML or Markdown for the static version
  author: {
    name: string;
    role: string;
    image: string;
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'The Ultimate Guide to Choosing the Perfect Bridal Saree',
    slug: 'best-sarees-for-weddings',
    excerpt: 'Discover everything you need to know about selecting a bridal saree that flatters your silhouette, matches your wedding theme, and honors tradition.',
    coverImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200',
    date: 'October 12, 2025',
    readTime: '6 min read',
    category: 'Bridal Guide',
    author: { name: 'Hema Sarees Editorial', role: 'Style Experts', image: '/logo.png' },
    content: `
      <h2>The Timeless Appeal of a Bridal Saree</h2>
      <p>Choosing your wedding saree is one of the most exciting parts of bridal shopping. Unlike lehengas that may only be worn once, a bridal saree is a lifelong investment that can be passed down as an heirloom.</p>
      
      <h3>1. Understanding Silk Varieties</h3>
      <p><strong>Kanjivaram Silk:</strong> Originating from Tamil Nadu, these are known for their rich temple borders, heavy weight, and incredible durability. They are the top choice for South Indian brides.</p>
      <p><strong>Banarasi Silk:</strong> Famous for their Mughal-inspired motifs (floral and foliate), Banarasi sarees are lighter than Kanjivaram but equally opulent with heavy brocade work.</p>
      
      <h3>2. Choosing the Right Color</h3>
      <p>While red remains the classic Indian bridal color symbolizing prosperity and fertility, modern brides are embracing new palettes. Pastel pinks, rich emerald greens, and royal blues are incredibly popular for receptions and sangeet ceremonies.</p>
      
      <h3>3. Draping Styles</h3>
      <p>The way you drape your saree can completely change your look. The classic Nivi drape works for almost everyone, but a Gujarati front-pallu drape highlights heavy border work beautifully.</p>
    `,
  },
  {
    title: 'How to Care for and Preserve Your Silk Sarees',
    slug: 'silk-saree-care',
    excerpt: 'Expert tips on washing, ironing, and storing your precious silk sarees to ensure they last for generations without losing their natural sheen.',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
    date: 'November 05, 2025',
    readTime: '4 min read',
    category: 'Care Guide',
    author: { name: 'Hema Sarees Editorial', role: 'Textile Experts', image: '/logo.png' },
    content: `
      <h2>Preserving the Sheen of Pure Silk</h2>
      <p>Silk sarees are delicate masterpieces that require proper care to maintain their luster and strength. Here is our comprehensive guide to silk saree maintenance.</p>
      
      <h3>1. Cleaning Your Silk Saree</h3>
      <p><strong>Always Dry Clean:</strong> For the first three washes, dry cleaning is mandatory. After that, if you must wash at home, use cold water and a specialized silk detergent or baby shampoo. Never wring or twist the fabric.</p>
      
      <h3>2. The Art of Storage</h3>
      <p>Never store silk sarees in plastic covers, as the fabric needs to breathe. Wrap them in clean, undyed cotton or muslin cloth. This protects them from dust while preventing moisture buildup.</p>
      
      <h3>3. Preventing Creases and Tears</h3>
      <p>The golden rule of silk saree storage is to refold them every three to six months. If left folded in the same position for years, the silk threads at the crease can weaken and tear.</p>
    `,
  },
  {
    title: 'How to Identify Authentic Pure Silk Sarees',
    slug: 'how-to-choose-silk-saree',
    excerpt: 'Learn the insider secrets to identifying genuine handloom silk sarees. Avoid synthetic blends with our definitive silk testing guide.',
    coverImage: 'https://images.unsplash.com/photo-1583391733958-d25e61c2c3ba?auto=format&fit=crop&q=80&w=1200',
    date: 'December 18, 2025',
    readTime: '5 min read',
    category: 'Buying Guide',
    author: { name: 'Hema Sarees Editorial', role: 'Textile Experts', image: '/logo.png' },
    content: `
      <h2>The Pure Silk Promise</h2>
      <p>With the market flooded with art silk and synthetic blends, identifying pure silk is a crucial skill for any saree enthusiast.</p>
      
      <h3>1. The Touch Test</h3>
      <p>Pure silk feels exceptionally smooth and soft. When you rub pure silk against your skin, it generates a slight warmth. Synthetic silk feels cold and lacks the soft texture of natural protein fibers.</p>
      
      <h3>2. The Crunch Test</h3>
      <p>Gather the silk fabric in your fist and squeeze it. Pure silk produces a distinct 'crunching' sound (known as scroop). When you release it, the wrinkles should fall out quickly.</p>
      
      <h3>3. The Burn Test (With Caution)</h3>
      <p>Take a single thread from the warp or weft (never from the main body). When burned, pure silk smells like burning hair, leaves a crisp black ash that crushes easily into powder, and stops burning when removed from the flame. Synthetic fibers melt like plastic and smell like burning chemicals.</p>
      
      <h3>4. Look for the Silk Mark</h3>
      <p>Always look for the Silk Mark certification — a guarantee of pure silk governed by the Silk Mark Organisation of India.</p>
    `,
  },
  {
    title: 'Saree Trends to Watch in 2026',
    slug: 'saree-trends-2026',
    excerpt: 'From pre-draped silhouettes to the revival of vintage weaves, explore the biggest saree trends dominating the fashion landscape this year.',
    coverImage: 'https://images.unsplash.com/photo-1585848529285-d858348ee7ed?auto=format&fit=crop&q=80&w=1200',
    date: 'January 10, 2026',
    readTime: '4 min read',
    category: 'Style & Trends',
    author: { name: 'Hema Sarees Editorial', role: 'Style Experts', image: '/logo.png' },
    content: `
      <h2>The Evolution of the Saree</h2>
      <p>The saree is constantly evolving while staying rooted in tradition. Here are the top trends we are seeing for 2026.</p>
      
      <h3>1. Pre-Draped and Concept Sarees</h3>
      <p>Convenience meets couture. Pre-draped sarees, saree gowns, and dhoti-style drapes are becoming the go-to choice for cocktail parties and modern receptions.</p>
      
      <h3>2. The Return of the Tissue Silk</h3>
      <p>Tissue silk sarees, known for their metallic sheen and crisp drape, are making a massive comeback, especially for daytime weddings and festive events.</p>
      
      <h3>3. Statement Blouses</h3>
      <p>The saree might be traditional, but the blouse is avant-garde. We're seeing dramatic bishop sleeves, intricate backless designs with latkans, and corset-style blouses dominating the runways.</p>
      
      <h3>4. Scalloped Borders</h3>
      <p>Moving away from straight zari borders, scalloped and cutwork borders add a soft, feminine, and contemporary edge to both silk and georgette sarees.</p>
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
