/**
 * lib/content/benefits.ts
 *
 * Transformation benefit copy library.
 * Maps fabric/occasion/category → 3 specific benefit statements.
 *
 * Rules:
 * - Benefits describe OUTCOMES for the customer, not specs of the fabric
 * - Use "you/your" language throughout
 * - Be specific: time, sensation, situation — not generic adjectives
 * - Relief-first: solve the pain before the aspiration
 */

export interface BenefitSet {
  icon: string;
  headline: string;
  sub?: string;
}

export interface FabricBenefits {
  fabric: string;
  tagline: string;
  benefits: [BenefitSet, BenefitSet, BenefitSet];
}

// ── Fabric-mapped benefits ───────────────────────────────────────────────────

const FABRIC_BENEFITS: FabricBenefits[] = [
  {
    fabric: 'Maheshwari Silk',
    tagline: 'Breathes like cotton, drapes like royalty',
    benefits: [
      {
        icon: '🌬️',
        headline: 'Stays cool for 12 hours',
        sub: 'Maheshwari weave creates air channels — comfortable through ceremonies, travel, and late evenings.',
      },
      {
        icon: '⏱️',
        headline: 'Drapes in under 2 minutes',
        sub: 'The lighter weight means fewer adjustments. Your pleats hold without constant re-pinning.',
      },
      {
        icon: '🏺',
        headline: 'Softer after every wash',
        sub: 'Unlike heavy silks that stiffen, Maheshwari gets more supple with age — a saree that improves with time.',
      },
    ],
  },
  {
    fabric: 'Banarasi Silk',
    tagline: 'Heirloom-grade — woven for centuries',
    benefits: [
      {
        icon: '✨',
        headline: 'Zari no machine can replicate',
        sub: `Patterns stored in 5,000-card punchcard stacks. Each row is unique. No machine makes this yet.`,
      },
      {
        icon: '📅',
        headline: 'Your daughter will want to wear it',
        sub: 'Banarasi silk is designed to be handed down. Stored correctly, it outlasts fashion trends by generations.',
      },
      {
        icon: '🌟',
        headline: 'Gets softer with every wear',
        sub: 'The natural protein structure of real silk relaxes with use — breaking in like a beloved heirloom.',
      },
    ],
  },
  {
    fabric: 'Pochampally Ikat',
    tagline: 'No two are alike — yours is one of a kind',
    benefits: [
      {
        icon: '🎨',
        headline: 'Impossible to duplicate — even by hand',
        sub: 'Ikat is resist-dyed before weaving. The blurred-edge patterns are a signature of human craft — beautiful, intentional.',
      },
      {
        icon: '💫',
        headline: 'Goes from office to occasion without changing',
        sub: 'Geometric Ikat reads sophisticated in a boardroom and festive at a celebration. One saree, two worlds.',
      },
      {
        icon: '🌊',
        headline: 'The drape adapts to your shape',
        sub: 'Ikat fabric has a natural give. It moves with you rather than holding you in place.',
      },
    ],
  },
  {
    fabric: 'Cotton',
    tagline: 'Machine-washable, all-day comfortable',
    benefits: [
      {
        icon: '🫧',
        headline: 'Machine-washable at home',
        sub: 'No dry-cleaning runs, no anxiety about spills. Wash, dry in shade, wear again. That simple.',
      },
      {
        icon: '☀️',
        headline: 'No sweat marks on summer afternoons',
        sub: 'Cotton absorbs and releases moisture faster than synthetic blends. Stay composed through 8-hour workdays.',
      },
      {
        icon: '🌿',
        headline: 'Comfortable enough to travel in',
        sub: 'Pack it, unpack it, wear it. Cotton holds its shape without ironing and gets softer the more you wear it.',
      },
    ],
  },
  {
    fabric: 'Linen',
    tagline: 'The coolest saree you will own',
    benefits: [
      {
        icon: '❄️',
        headline: 'Naturally cooler in summer heat',
        sub: 'Linen has the highest natural thermal conductivity of any plant fibre. Science-backed comfort.',
      },
      {
        icon: '💪',
        headline: 'More durable than cotton, softer with age',
        sub: 'Linen fibre strengthens with washing. It literally gets better every time you wear it.',
      },
      {
        icon: '🌱',
        headline: 'No artificial finishing needed',
        sub: 'The natural texture is the feature — no starching, no ironing required. Effortless elegance.',
      },
    ],
  },
  {
    fabric: 'Chiffon',
    tagline: 'Floats when you move — effortlessly graceful',
    benefits: [
      {
        icon: '🌸',
        headline: 'Half the weight of traditional silk',
        sub: 'Chiffon drapes without pulling or tugging. Your shoulders stay relaxed through hours of celebration.',
      },
      {
        icon: '💃',
        headline: 'Your pallu stays perfect when you dance',
        sub: 'The lightweight drape moves with gesture, not against it. Designed for women who live in their sarees.',
      },
      {
        icon: '🎭',
        headline: 'Photographs beautifully in natural light',
        sub: 'The sheer layers catch light differently than solid fabrics — every photo has dimension and depth.',
      },
    ],
  },
  {
    fabric: 'Tussar Silk',
    tagline: 'Wild silk — earthy, rich, irreplaceable',
    benefits: [
      {
        icon: '🌳',
        headline: 'Natural texture no loom can plan',
        sub: 'Tussar comes from wild silk worms. The irregularity is the authenticity.',
      },
      {
        icon: '🍂',
        headline: 'Looks richer in person than in photos',
        sub: 'Unlike smooth silks, Tussar has depth that cameras struggle to capture. It rewards being seen in real light.',
      },
      {
        icon: '🤝',
        headline: 'Holds natural dyes longer than cultivated silk',
        sub: 'The coarser protein structure of Tussar bonds with natural dyes deeply — colors that age into richness.',
      },
    ],
  },
  {
    fabric: 'Georgette',
    tagline: 'Flows like water — move in total freedom',
    benefits: [
      {
        icon: '🌊',
        headline: 'Drapes itself — no petticoat wrestling',
        sub: 'The crinkled weave creates natural drape that holds without aggressive tucking or pleating.',
      },
      {
        icon: '✈️',
        headline: 'Pack it, wear it crease-free',
        sub: 'Georgette is virtually wrinkle-resistant. Ideal for travel, destination events, long journeys.',
      },
      {
        icon: '🌙',
        headline: 'Moves beautifully in evening light',
        sub: 'The matte finish catches ambient light subtly — elegant without demanding attention.',
      },
    ],
  },
];

// ── Occasion-mapped override benefits ────────────────────────────────────────

interface OccasionBenefitOverride {
  occasion: string;
  benefits: [BenefitSet, BenefitSet, BenefitSet];
}

const OCCASION_OVERRIDES: OccasionBenefitOverride[] = [
  {
    occasion: 'Bridal',
    benefits: [
      {
        icon: '💍',
        headline: 'Woven for the one day you remember forever',
        sub: 'Bridal sarees at HemaSaree are made to be passed down, not packed away after.',
      },
      {
        icon: '📸',
        headline: 'Photographs with depth for 50 years',
        sub: 'The zari catches light differently in every photo. Your memories will stay vivid.',
      },
      {
        icon: '🕊️',
        headline: 'Your grandmother will recognize it',
        sub: 'Patterns inherited from 200-year-old punchcard stacks. Continuity you can wear.',
      },
    ],
  },
  {
    occasion: 'Daily Wear',
    benefits: [
      {
        icon: '🌅',
        headline: 'Comfortable from morning puja to evening chai',
        sub: 'Lightweight enough to wear all day without fatigue — not just for special occasions.',
      },
      {
        icon: '💧',
        headline: 'Handles real life — including the kitchen',
        sub: 'Machine-washable fabrics that clean easily and dry fast.',
      },
      {
        icon: '🔄',
        headline: 'Mix with different blouses for 10 looks',
        sub: 'Versatile base colors that pair with what you already own.',
      },
    ],
  },
  {
    occasion: 'Festive',
    benefits: [
      {
        icon: '🪔',
        headline: 'Vivid colors that stay vivid after Diwali',
        sub: "Festival colors fixed with natural mordants — the richness survives washing and sunlight.",
      },
      {
        icon: '🎊',
        headline: 'Comfortable for 6-hour celebrations',
        sub: "Festive doesn't have to mean heavy. Our picks balance visual impact with all-day wearability.",
      },
      {
        icon: '📷',
        headline: 'Every family photo looks like a portrait',
        sub: 'Deep, saturated festival colors photograph brilliantly — even on a phone camera.',
      },
    ],
  },
];

// ── Default fallback ─────────────────────────────────────────────────────────

const DEFAULT_BENEFITS: [BenefitSet, BenefitSet, BenefitSet] = [
  {
    icon: '🪡',
    headline: 'Handwoven — not mass-produced',
    sub: 'Every saree is made by a person, in a place, with a name. Not a factory floor.',
  },
  {
    icon: '↩️',
    headline: '7-day free returns, no questions',
    sub: "If it doesn't feel right when you drape it, return it. Free pickup, zero hassle.",
  },
  {
    icon: '📦',
    headline: 'Arrives in artisan packaging',
    sub: 'Muslin wrap, handmade paper box, and a handwritten care note from the weaver.',
  },
];

// ── Lookup functions ─────────────────────────────────────────────────────────

/**
 * Get benefit set for a fabric type.
 * Falls back to DEFAULT_BENEFITS if fabric not in library.
 */
export function getBenefitsForFabric(
  fabric?: string
): [BenefitSet, BenefitSet, BenefitSet] {
  if (!fabric) return DEFAULT_BENEFITS;

  const normalised = fabric.toLowerCase().trim();

  const exact = FABRIC_BENEFITS.find(
    (fb) => fb.fabric.toLowerCase() === normalised
  );
  if (exact) return exact.benefits;

  const partial = FABRIC_BENEFITS.find(
    (fb) =>
      normalised.includes(fb.fabric.toLowerCase()) ||
      fb.fabric.toLowerCase().includes(normalised)
  );
  if (partial) return partial.benefits;

  if (normalised.includes('cotton')) return FABRIC_BENEFITS.find(f => f.fabric === 'Cotton')!.benefits;
  if (normalised.includes('silk'))   return FABRIC_BENEFITS.find(f => f.fabric === 'Maheshwari Silk')!.benefits;
  if (normalised.includes('linen'))  return FABRIC_BENEFITS.find(f => f.fabric === 'Linen')!.benefits;
  if (normalised.includes('chiffon')) return FABRIC_BENEFITS.find(f => f.fabric === 'Chiffon')!.benefits;
  if (normalised.includes('georgette')) return FABRIC_BENEFITS.find(f => f.fabric === 'Georgette')!.benefits;
  if (normalised.includes('tussar')) return FABRIC_BENEFITS.find(f => f.fabric === 'Tussar Silk')!.benefits;
  if (normalised.includes('ikat'))   return FABRIC_BENEFITS.find(f => f.fabric === 'Pochampally Ikat')!.benefits;

  return DEFAULT_BENEFITS;
}

/**
 * Get benefit set for an occasion — overrides fabric if occasion is specific.
 */
export function getBenefitsForOccasion(
  occasion?: string
): [BenefitSet, BenefitSet, BenefitSet] | null {
  if (!occasion) return null;
  const normalised = occasion.toLowerCase();
  const match = OCCASION_OVERRIDES.find((o) =>
    normalised.includes(o.occasion.toLowerCase())
  );
  return match?.benefits ?? null;
}

/**
 * Get the final benefit set, preferring occasion override over fabric.
 */
export function getBenefits(opts: {
  fabric?: string;
  occasion?: string;
  category?: string;
}): [BenefitSet, BenefitSet, BenefitSet] {
  const occasionBenefits = getBenefitsForOccasion(opts.occasion ?? opts.category);
  if (occasionBenefits) return occasionBenefits;
  return getBenefitsForFabric(opts.fabric);
}

/**
 * Get tagline for a fabric type (used as card category label teaser).
 */
export function getFabricTagline(fabric?: string): string {
  if (!fabric) return 'Handwoven with care';
  const normalised = fabric.toLowerCase().trim();
  const match = FABRIC_BENEFITS.find(
    (fb) =>
      fb.fabric.toLowerCase() === normalised ||
      normalised.includes(fb.fabric.toLowerCase())
  );
  return match?.tagline ?? 'Handwoven with care';
}
