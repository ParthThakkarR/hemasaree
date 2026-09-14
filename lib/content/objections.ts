/**
 * lib/content/objections.ts
 *
 * Objection → Answer library.
 * Sourced from real customer questions and support patterns.
 *
 * Used by:
 * - FAQSection (homepage) — category tabs + search
 * - ProductAccordion — "Returns & Guarantee" section
 * - Quick-view modal — pre-checkout objection clearing
 */

export type ObjectionCategory =
  | 'Fit & Sizing'
  | 'Fabric Feel'
  | 'Returns & Exchanges'
  | 'Shipping'
  | 'Authenticity'
  | 'Care'
  | 'General';

export interface Objection {
  id: string;
  category: ObjectionCategory;
  question: string;
  answer: string;
  schema: boolean; // Include in FAQ JSON-LD schema
}

export const OBJECTIONS: Objection[] = [
  // ── Fit & Sizing ────────────────────────────────────────────────────────
  {
    id: 'saree-length',
    category: 'Fit & Sizing',
    question: 'Will this saree fit me? I am not a standard size.',
    answer:
      'Every saree at HemaSaree is 5.5 meters in length with a 0.8-meter blouse piece. Sarees are not sized like readymade garments — the draping style adjusts to your height and build. Whether you are petite or tall, a saree is one of the few garments that adapts to you, not the other way around. If you have specific length concerns, message us on WhatsApp and we will guide you.',
    schema: true,
  },
  {
    id: 'blouse-stitching',
    category: 'Fit & Sizing',
    question: 'Does the saree come with a stitched blouse?',
    answer:
      'All sarees include an unstitched blouse piece (0.8 meters) so your tailor can stitch it to your exact measurements. We prefer unstitched blouses because it gives you complete freedom — the neckline, sleeve style, and fit are entirely yours. If you need stitching guidance, our care guide includes blouse measurement tips.',
    schema: true,
  },
  {
    id: 'first-time-drape',
    category: 'Fit & Sizing',
    question: "I have never draped a saree before. Is this too difficult for a beginner?",
    answer:
      "Most of our sarees are beginner-friendly — especially lighter fabrics like cotton, Maheshwari, and georgette. These hold pleats more easily and require fewer adjustments. We include a QR code to a draping video with every order. If you'd like a recommendation for your first saree, message us and we'll suggest the easiest draping styles for your body type.",
    schema: true,
  },

  // ── Fabric Feel ─────────────────────────────────────────────────────────
  {
    id: 'silk-heat',
    category: 'Fabric Feel',
    question: 'Will silk be too hot to wear in Indian summer?',
    answer:
      'It depends on the silk. Heavy Banarasi and Kanjivaram silks can feel warm in peak summer. However, Maheshwari silk and Tussar silk are significantly lighter and more breathable — designed for year-round wear. Our product descriptions specify whether a saree is summer-appropriate. When in doubt, filter by "Daily Wear" or "Cotton" for guaranteed comfort in heat.',
    schema: true,
  },
  {
    id: 'online-touch',
    category: 'Fabric Feel',
    question: "How do I know the fabric will feel as good as it looks in photos?",
    answer:
      'This is the most honest question you can ask. Photos flatten texture. We know that. So we do three things: our product descriptions specify thread count, weight, and finish in plain language (not marketing speak); we have a 7-day free return policy — if the fabric does not feel right, return it at no cost; and our customer reviews often include texture notes from real buyers. We would rather you trust the returns process than guess from a screen.',
    schema: true,
  },
  {
    id: 'zari-scratch',
    category: 'Fabric Feel',
    question: 'Will the zari work feel scratchy or uncomfortable against my skin?',
    answer:
      'Real zari — gold and silver thread — has a smooth finish when woven correctly. Cheap zari substitutes often use plastic-coated thread that can feel rough. All HemaSaree zari sarees use real metallic thread woven into the fabric, not glued onto it. You may feel the slight weight of the border, but not any scratchiness on the skin side of the drape.',
    schema: true,
  },

  // ── Returns & Exchanges ─────────────────────────────────────────────────
  {
    id: 'return-policy',
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer:
      'We offer a 7-day return window from the date of delivery. If the saree does not feel right when you drape it — wrong shade, unexpected texture, any reason at all — we will arrange a free pickup. No questions asked. Refunds are processed within 5-7 business days of receiving the return. The saree must be in its original, unworn condition with tags intact.',
    schema: true,
  },
  {
    id: 'exchange',
    category: 'Returns & Exchanges',
    question: 'Can I exchange for a different colour or saree?',
    answer:
      'Yes. Within 7 days of delivery, you can request an exchange for any available product. The price difference (if any) is charged or refunded. Contact us via WhatsApp or email with your order number and the replacement product you want. We handle the pickup and redelivery at no extra cost.',
    schema: true,
  },
  {
    id: 'damaged-delivery',
    category: 'Returns & Exchanges',
    question: 'What if my saree arrives damaged or is the wrong product?',
    answer:
      'We inspect every saree before dispatch. But if something goes wrong in transit or a wrong item was sent, we will replace it immediately — no return required in most cases. Send us a photo of the damage within 48 hours of delivery via WhatsApp (+91 94294 75736) and we will arrange a replacement at zero cost.',
    schema: true,
  },

  // ── Shipping ─────────────────────────────────────────────────────────────
  {
    id: 'delivery-time',
    category: 'Shipping',
    question: 'How long will delivery take?',
    answer:
      'We dispatch within 24-48 hours of order confirmation. Standard delivery takes 3-7 business days within India, depending on your location. Metro cities typically receive orders in 3-4 days. Remote pin codes may take up to 7 days. You will receive a tracking link via SMS and email once dispatched.',
    schema: true,
  },
  {
    id: 'delivery-cost',
    category: 'Shipping',
    question: 'Is delivery free?',
    answer:
      'We offer free standard delivery on orders above ₹1,500. For orders below this, a nominal shipping charge applies at checkout. Express delivery options are available at additional cost. All orders are tracked end-to-end.',
    schema: true,
  },
  {
    id: 'cod',
    category: 'Shipping',
    question: 'Do you offer Cash on Delivery (COD)?',
    answer:
      'Yes. Cash on Delivery is available for most pin codes across India. You can select COD at checkout. Please note that COD orders may take an additional 1-2 days to process. For high-value orders above ₹10,000, we recommend prepaid payment for faster dispatch.',
    schema: true,
  },

  // ── Authenticity ─────────────────────────────────────────────────────────
  {
    id: 'authentic-handloom',
    category: 'Authenticity',
    question: 'How do I know this is a genuine handloom saree and not machine-made?',
    answer:
      'All handloom sarees at HemaSaree come with the artisan\'s name, village, and craft on the product page. Genuine handloom has slight irregularities in weave that are impossible to replicate mechanically — this is a feature, not a flaw. We work directly with weaver cooperatives in Maheshwar, Pochampally, and Varanasi. Each saree includes a provenance card with the artisan\'s details.',
    schema: true,
  },
  {
    id: 'silk-purity',
    category: 'Authenticity',
    question: 'Is the silk pure, or is it blended with synthetic fibre?',
    answer:
      'We clearly specify fabric composition on every product listing — "Pure Silk," "Silk Blend," or specific percentages. If the listing says pure silk, it is pure silk. We do stock some silk-cotton and silk-viscose blends, which are priced and described accordingly. If you are unsure about a specific product, message us before purchasing — we will tell you exactly what is in it.',
    schema: true,
  },
  {
    id: 'gi-tag',
    category: 'Authenticity',
    question: 'Do your Banarasi and Kanjivaram sarees have GI tags?',
    answer:
      'We are working toward GI tag certification for our artisan partners. Currently, our Banarasi silk sarees from Kamala Ansari\'s cooperative are authentic Varanasi-woven pieces. We provide detailed provenance documentation with each purchase. If GI-tagged sarees are important for your specific requirement, please contact us and we will source accordingly.',
    schema: false,
  },

  // ── Care ─────────────────────────────────────────────────────────────────
  {
    id: 'silk-washing',
    category: 'Care',
    question: 'Can I wash silk sarees at home, or must I dry clean?',
    answer:
      'Heavy Banarasi and embroidered silks should be dry cleaned — the zari and embellishments can be damaged by water. Lighter silks like Maheshwari and Tussar can be gently hand-washed in cold water with a pH-neutral detergent (never wring — press gently and dry in shade). Every HemaSaree order includes a fabric-specific care guide card. When in doubt, dry clean.',
    schema: true,
  },
  {
    id: 'storage',
    category: 'Care',
    question: 'How should I store my sarees to prevent damage?',
    answer:
      'Fold and store in clean muslin or cotton cloth — never plastic, which traps moisture and causes mildew. Refold along different lines every 3-6 months to prevent permanent crease marks. Store in a cool, dry place away from direct sunlight. For silk sarees, place a few neem leaves in the storage box to deter moths naturally. Avoid mothballs — the chemicals can damage delicate fibres and zari.',
    schema: true,
  },
  {
    id: 'color-fade',
    category: 'Care',
    question: 'Will the colours fade after washing?',
    answer:
      'Natural dyes used in handloom sarees are mordant-fixed — they deepen slightly with first washing and then stabilize. Synthetic dyes on machine-made sarees fade faster. Wash dark-coloured sarees separately for the first 1-2 washes. Never use harsh detergent or bleach. Dry in shade, not direct sunlight, which breaks down dye bonds over time.',
    schema: true,
  },

  // ── General ──────────────────────────────────────────────────────────────
  {
    id: 'gift-packaging',
    category: 'General',
    question: 'Can I send a saree as a gift? Do you offer gift packaging?',
    answer:
      'All HemaSaree orders come in artisan packaging — muslin wrap and a handmade paper box with an artisan note. For gifting, you can add a personalised message at checkout (free). We also offer premium gift packaging with ribbon and a hand-stamped envelope (small additional charge). The gift will be delivered without any price tags or invoice.',
    schema: true,
  },
  {
    id: 'bulk-orders',
    category: 'General',
    question: 'Do you accept bulk or wedding trousseau orders?',
    answer:
      'Yes. We regularly fulfill wedding trousseau orders, corporate gifting, and family orders. For 5+ sarees, contact us on WhatsApp (+91 94294 75736) to discuss customization options, custom color matching, and volume pricing. Lead time for custom trousseau orders is typically 3-6 weeks depending on the weave.',
    schema: false,
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export const ALL_CATEGORIES: ObjectionCategory[] = [
  'Fit & Sizing',
  'Fabric Feel',
  'Returns & Exchanges',
  'Shipping',
  'Authenticity',
  'Care',
  'General',
];

/**
 * Get objections filtered by category.
 */
export function getObjectionsByCategory(
  category: ObjectionCategory
): Objection[] {
  return OBJECTIONS.filter((o) => o.category === category);
}

/**
 * Get only schema-eligible objections (for FAQ JSON-LD).
 */
export function getSchemaObjections(): Objection[] {
  return OBJECTIONS.filter((o) => o.schema);
}

/**
 * Search objections by keyword in question or answer.
 */
export function searchObjections(query: string): Objection[] {
  const q = query.toLowerCase().trim();
  if (!q) return OBJECTIONS;
  return OBJECTIONS.filter(
    (o) =>
      o.question.toLowerCase().includes(q) ||
      o.answer.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q)
  );
}

/**
 * Generate FAQ JSON-LD schema from schema-eligible objections.
 */
export function generateFAQSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getSchemaObjections().map((o) => ({
      '@type': 'Question',
      name: o.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: o.answer,
      },
    })),
  };
}
