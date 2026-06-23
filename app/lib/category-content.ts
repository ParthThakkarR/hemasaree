/**
 * Static content for category pages — used for SEO, AEO, and GEO.
 * Each category has an intro, buying guide, styling tips, and FAQs.
 */

export interface CategoryContent {
  intro: string;
  buyingGuide: string;
  stylingTips: string;
  faqs: { question: string; answer: string }[];
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  bridal: {
    intro:
      'Explore our exquisite collection of bridal sarees, curated for the most special day of your life. Each piece is crafted with premium fabrics, intricate zari work, and luxurious embellishments that reflect centuries of Indian bridal tradition. From rich Banarasi silks to opulent Kanjivaram weaves, find the perfect saree to match your dream wedding look.',
    buyingGuide:
      'When choosing a bridal saree, consider the wedding ceremony type, venue, and season. For traditional ceremonies, opt for rich reds, maroons, or gold. South Indian brides often prefer Kanjivaram silk, while North Indian brides lean towards Banarasi. Check the fabric weight — heavier sarees drape beautifully but can be tiring for long ceremonies. Always verify the zari quality (pure gold/silver vs. tested zari) and ensure the blouse piece is included.',
    stylingTips:
      'Style your bridal saree with statement kundan or polki jewelry. A contrasting blouse with heavy embroidery elevates the look. Pin your pallu securely for comfort during the ceremony. Add a waist belt (kamarband) for a regal touch. Complete the look with traditional bangles, maang tikka, and embroidered juttis or heels.',
    faqs: [
      { question: 'What is the best fabric for a bridal saree?', answer: 'Pure silk — especially Kanjivaram or Banarasi — is considered the gold standard for bridal sarees in India. These fabrics have a natural sheen, excellent drape, and can hold heavy embroidery and zari work.' },
      { question: 'How much does a good bridal saree cost?', answer: 'A quality bridal saree typically ranges from ₹5,000 to ₹50,000+ depending on the fabric, zari quality, and craftsmanship. At Hema Sarees, we offer premium bridal sarees starting at competitive prices.' },
      { question: 'What color saree is best for wedding?', answer: 'Traditional bridal colors include red, maroon, gold, and magenta. However, modern brides also choose pastel pinks, coral, emerald green, and royal blue. The best color depends on your skin tone and ceremony traditions.' },
      { question: 'How to drape a bridal saree?', answer: 'The Nivi style is the most popular draping method for bridal sarees. Start with tucking pleats at the waist, wrap around, and bring the pallu over the left shoulder. For a South Indian look, pin the pallu at the right shoulder. Consider hiring a professional draper for your wedding day.' },
    ],
  },
  silk: {
    intro:
      'Discover the timeless elegance of pure silk sarees at Hema Sarees. Our silk collection features authentic handwoven pieces from India\'s finest weaving traditions — Kanjivaram, Banarasi, Tussar, Chanderi, and more. Each silk saree is a masterpiece of artisan craftsmanship, featuring lustrous fabric, rich colors, and intricate motifs that tell stories of India\'s textile heritage.',
    buyingGuide:
      'When buying a silk saree, always check the fabric purity — a genuine silk saree should have a natural sheen and feel smooth to touch. Look for the silk mark certification for authenticity. Consider the occasion: Kanjivaram for weddings, Tussar for casual elegance, Chanderi for lightweight comfort. Check the weave quality, border width, and pallu design. A good silk saree should have consistent weaving without pulls or snags.',
    stylingTips:
      'Silk sarees look stunning with traditional gold jewelry. For a contemporary look, pair with a designer blouse and statement earrings. Avoid heavy accessories that compete with the saree\'s natural beauty. Steam iron on low heat (never directly) to maintain the fabric\'s sheen. Store wrapped in muslin cloth to preserve the silk.',
    faqs: [
      { question: 'How to identify pure silk saree?', answer: 'Pure silk sarees have a natural sheen, produce a crunching sound when crushed in your fist, and feel warm to touch. The burn test (pure silk smells like burnt hair) is definitive. Look for the Silk Mark label, which certifies the purity.' },
      { question: 'Which silk saree is best for summer?', answer: 'Tussar silk and Chanderi silk are lightweight and breathable, making them ideal for summer. Avoid heavy Kanjivaram silk in hot weather. Mulberry silk blends also offer comfort in warmer months.' },
      { question: 'How to wash silk saree at home?', answer: 'Dry cleaning is recommended for most silk sarees. If hand washing, use cold water with mild detergent, soak for 5 minutes max, rinse gently, and dry in shade. Never wring or twist a silk saree. Iron on low heat with a cloth barrier.' },
      { question: 'What is the difference between Kanjivaram and Banarasi silk?', answer: 'Kanjivaram (from Tamil Nadu) features temple-inspired motifs, heavier weight, and contrast borders woven separately. Banarasi (from Varanasi) is known for Mughal-inspired patterns, brocade work, and lighter weight. Both are premium wedding choices.' },
    ],
  },
  festive: {
    intro:
      'Celebrate every festival in style with our curated festive saree collection. From Diwali to Navratri, Pongal to Onam — find vibrant, comfortable, and beautiful sarees designed for joyous celebrations. Our festive range includes rich silks, comfortable cotton blends, and trendy georgettes in auspicious colors and festive motifs.',
    buyingGuide:
      'For festive occasions, choose sarees that balance beauty with comfort — you\'ll be wearing them for extended celebrations. Opt for medium-weight fabrics like art silk, crepe, or cotton-silk blends. Bright colors like red, yellow, green, and orange are traditionally auspicious. Consider the festival type: lightweight cotton for Pongal, rich silk for Diwali, vibrant colors for Navratri.',
    stylingTips:
      'Pair your festive saree with temple jewelry for a traditional look, or contemporary accessories for a modern twist. Experiment with different blouse styles — puff sleeves, boat neck, or backless. Add fresh flower garlands in your hair for an authentic festive touch. Complete the look with matching bangles and comfortable footwear.',
    faqs: [
      { question: 'What saree to wear for Diwali?', answer: 'For Diwali, opt for sarees in auspicious colors like red, gold, yellow, or emerald green. Silk sarees with zari work look stunning for evening celebrations. Art silk or crepe sarees are great lightweight alternatives.' },
      { question: 'Which color saree is best for Navratri?', answer: 'Each day of Navratri has a designated color. Popular choices include red (Day 1), royal blue (Day 2), yellow (Day 3), green (Day 4), grey (Day 5), orange (Day 6), white (Day 7), pink (Day 8), and purple (Day 9).' },
      { question: 'Can I wear a cotton saree for festivals?', answer: 'Absolutely! Cotton sarees are perfect for daytime festival celebrations. Choose cotton sarees with block prints, temple borders, or Kalamkari work for a festive yet comfortable look. Pair with oxidized silver jewelry for a stunning traditional appearance.' },
    ],
  },
  casual: {
    intro:
      'Elevate your everyday style with our casual saree collection. Perfect for daily wear, office, and informal gatherings, these sarees combine comfort with effortless elegance. From soft cotton handlooms to flowing georgettes and linen sarees, discover pieces that make you feel beautiful every day without compromising on comfort.',
    buyingGuide:
      'For casual sarees, prioritize comfort and ease of maintenance. Cotton, linen, and georgette are ideal everyday fabrics. Choose lighter colors and simpler prints for office wear, and bolder prints for casual outings. Pre-washed cotton sarees are easier to maintain. Consider sarees with pre-stitched pleats for quick draping.',
    stylingTips:
      'Keep accessories minimal for casual sarees — small studs, a simple chain, and a watch work perfectly. Pair with a well-fitted cotton blouse. For office wear, opt for solid-color sarees with a contrast blouse. Add a belt at the waist for a modern, structured look. Comfortable flats or block heels complete the everyday ensemble.',
    faqs: [
      { question: 'What fabric is best for daily wear sarees?', answer: 'Cotton, mul cotton, and linen are the best fabrics for daily wear. They are breathable, comfortable, easy to wash, and durable. Georgette and crepe are also good options for a slightly dressier everyday look.' },
      { question: 'How to drape a saree quickly for office?', answer: 'Use a pre-pleated saree petticoat for faster draping. The Nivi style is quickest — tuck the saree at the waist, make 5-6 pleats, wrap around, and pin the pallu. With practice, you can drape in under 5 minutes. Safety pins at key points help maintain the drape all day.' },
    ],
  },
  'party wear': {
    intro:
      'Make a statement at every celebration with our party wear saree collection. From cocktail evenings to sangeet nights, find sarees that blend contemporary glamour with traditional elegance. Our party wear range features luxurious georgettes, sequined chiffons, designer pre-draped sarees, and bold prints that ensure you stand out.',
    buyingGuide:
      'For party wear, focus on fabric drape and embellishment. Georgette, chiffon, and satin create a fluid silhouette ideal for parties. Consider the event type: sequined sarees for cocktails, printed sarees for brunches, embroidered sarees for evening events. Darker colors (navy, black, burgundy) suit evening affairs, while pastels work for daytime parties.',
    stylingTips:
      'Go bold with accessories — statement earrings, cocktail rings, and a sleek clutch. Experiment with trendy blouse designs: off-shoulder, halter neck, or cape style. A pre-draped saree is perfect for a fuss-free party look. Add stilettos for height and drama. A smokey eye and bold lip complete the party-ready look.',
    faqs: [
      { question: 'What type of saree is best for parties?', answer: 'Georgette, chiffon, satin, and net sarees are perfect for parties. They drape beautifully and look glamorous. For cocktail parties, opt for sequined or metallic sarees. For casual parties, printed or embroidered sarees work wonderfully.' },
      { question: 'How to style a saree for a cocktail party?', answer: 'Choose a sleek fabric like satin or georgette in dark tones. Pair with a designer blouse — try off-shoulder, one-shoulder, or cape styles. Add statement jewelry, stilettos, and a clutch. A draped saree style (dhoti or pre-draped) gives a modern, edgy look perfect for cocktails.' },
    ],
  },
  cotton: {
    intro:
      'Embrace the comfort and beauty of pure cotton sarees from Hema Sarees. Our cotton collection celebrates India\'s rich handloom traditions — from delicate Chanderi weaves to bold Kalamkari prints, soft Bengali tant to elegant Maheshwari. Each cotton saree is breathable, skin-friendly, and perfect for India\'s diverse climate.',
    buyingGuide:
      'When choosing a cotton saree, check the thread count — higher counts mean softer fabric. Look for handloom marks for authentic handwoven pieces. Pre-washed cotton sarees are softer and shrink less. Consider the weave type: Tant for lightweight elegance, Khadi for textured richness, Ikat for geometric patterns. Always check colorfastness — quality cotton sarees don\'t bleed.',
    stylingTips:
      'Cotton sarees pair beautifully with oxidized silver jewelry for a boho-chic look. Keep blouses simple — ikat, block print, or solid cotton. Starch lightly for crisp pleats. A cotton saree with a belt gives a modern silhouette. Add kolhapuri chappals or juttis for a complete ethnic look.',
    faqs: [
      { question: 'Are cotton sarees good for summer?', answer: 'Cotton sarees are the best choice for summer in India. Pure cotton is highly breathable, absorbs sweat, and keeps you cool. Mul cotton and mulmul are especially lightweight and airy for hot weather.' },
      { question: 'How to maintain cotton sarees?', answer: 'Wash cotton sarees in cold water with mild detergent. Avoid wringing — gently squeeze and hang to dry. Iron while slightly damp for best results. Store folded in cotton bags. Re-starch occasionally for crisp draping.' },
      { question: 'What is the difference between handloom and power-loom cotton?', answer: 'Handloom cotton is woven manually on traditional looms, creating unique textures and slight irregularities that add character. Power-loom cotton is machine-made, more uniform, and usually cheaper. Handloom sarees are more breathable, durable, and support artisan communities.' },
    ],
  },
};

/**
 * Get category content by name (case-insensitive).
 */
export function getCategoryContent(categoryName: string): CategoryContent | null {
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_CONTENT[key] || null;
}
