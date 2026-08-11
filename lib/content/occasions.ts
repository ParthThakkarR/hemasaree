/**
 * lib/content/occasions.ts
 *
 * Moment-based navigation. Not categories -- occasions.
 * The question isn't "What fabric?" -- it's "What is happening in your life?"
 */

export interface Occasion {
  id: string;
  moment: string;
  momentDevanagari: string;
  description: string;
  feeling: string;
  image: string;
  overlayColor: string;
  filterParams: Record<string, string>;
  slug: string;
}

export const occasions: Occasion[] = [
  {
    id: "bridal",
    moment: "The morning you become a bride",
    momentDevanagari: "\u0935\u0939 \u0938\u0941\u092c\u0939 \u091c\u092c \u0906\u092a \u0926\u0941\u0932\u094d\u0939\u0928 \u092c\u0928\u0924\u0940 \u0939\u0948\u0902",
    description:
      "Every woman deserves to wear something that will be handed down. Something that carries the weight of beginning.",
    feeling: "Transformed. Nervous. Beautiful. Yours.",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-kumkum-950/70",
    filterParams: { category: "Bridal" },
    slug: "bridal",
  },
  {
    id: "first-diwali",
    moment: "First Diwali in a new home",
    momentDevanagari: "\u0928\u090f \u0918\u0930 \u0915\u0940 \u092a\u0939\u0932\u0940 \u0926\u0940\u0935\u093e\u0932\u0940",
    description:
      "The year you light diyas for the first time in your own doorway. You want to look like you have always belonged here.",
    feeling: "Proud. A little homesick. Hopeful.",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-haldi-deep/70",
    filterParams: { category: "Festive", occasion: "Festive" },
    slug: "first-diwali",
  },
  {
    id: "vidai",
    moment: "Your daughter's vidai",
    momentDevanagari: "\u092c\u0947\u091f\u0940 \u0915\u0940 \u0935\u093f\u0926\u093e\u0908",
    description:
      "The one she will remember you in, always. Choose something that says: I am proud. I am holding myself together. I love you.",
    feeling: "Bittersweet. Radiant. Letting go.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-neem-deep/70",
    filterParams: { category: "Silk", occasion: "Wedding" },
    slug: "vidai",
  },
  {
    id: "promotion-puja",
    moment: "Your own promotion puja",
    momentDevanagari: "\u0905\u092a\u0928\u0940 \u092a\u0926\u094b\u0928\u094d\u0928\u0924\u093f \u0915\u0940 \u092a\u0942\u091c\u093e",
    description:
      "You earned this. Wear something that knows it. Something that says yes, I did the work, and yes, I also wore six yards today.",
    feeling: "Quietly triumphant. Professional. Yourself.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-kajal/70",
    filterParams: { category: "Party Wear" },
    slug: "promotion-puja",
  },
  {
    id: "gifting",
    moment: "The saree you give her",
    momentDevanagari: "\u0935\u0939 \u0938\u093e\u0921\u093c\u0940 \u091c\u094b \u0906\u092a \u0909\u0938\u0947 \u0926\u0947\u0924\u0940 \u0939\u0948\u0902",
    description:
      "Your mother. Your mother-in-law. Your best friend who just became a mother. Some gifts are chosen in minutes and remembered for a lifetime.",
    feeling: "Generous. Thoughtful. Connecting.",
    image: "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-kumkum-900/65",
    filterParams: { occasion: "Gifting" },
    slug: "gifting",
  },
  {
    id: "everyday-ritual",
    moment: "Tuesday. Just because.",
    momentDevanagari: "\u092e\u0902\u0917\u0932\u0935\u093e\u0930\u0964 \u092c\u0938 \u0910\u0938\u0947 \u0939\u0940\u0964",
    description:
      "The ones you reach for without thinking. Soft enough to travel in, beautiful enough to not want to take off.",
    feeling: "Comfortable. Quietly beautiful. Free.",
    image: "https://images.unsplash.com/photo-1595956553066-fe24a8c33395?auto=format&fit=crop&q=80&w=900",
    overlayColor: "from-chandan-warm/80",
    filterParams: { category: "Casual" },
    slug: "everyday-ritual",
  },
];

export function getOccasionBySlug(slug: string): Occasion | undefined {
  return occasions.find((o) => o.slug === slug);
}
