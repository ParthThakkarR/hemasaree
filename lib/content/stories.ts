/**
 * lib/content/stories.ts
 *
 * Artisan narrative content layer.
 * Specific, human, deeply Indian.
 *
 * Note: All long prose strings use template literals to avoid
 * apostrophe-in-single-quoted-string parse errors.
 */

export interface ArtisanStory {
  id: string;
  name: string;
  nameDevanagari: string;
  age: number;
  village: string;
  district: string;
  state: string;
  region: string;
  craft: string;
  craftDevanagari: string;
  daysWoven: number;
  voiceLine: string;
  voiceLineTransliterated?: string;
  story: string;
  personal: string;
  prideNote: string;
  portrait: string;
  sareeImage: string;
  audioSrc?: string;
  categoryFilter: string;
  slug: string;
}

export const artisanStories: ArtisanStory[] = [
  {
    id: "lakshmi-maheshwar",
    name: "Lakshmi Devi",
    nameDevanagari: "\u0932\u0915\u094d\u0937\u094d\u092e\u0940 \u0926\u0947\u0935\u0940",
    age: 52,
    village: "Maheshwar",
    district: "Khargone",
    state: "Madhya Pradesh",
    region: "Malwa, MP",
    craft: "Maheshwari Silk",
    craftDevanagari: "\u092e\u093e\u0939\u0947\u0936\u094d\u0935\u0930\u0940 \u0930\u0947\u0936\u092e",
    daysWoven: 47,
    voiceLine: "The shuttle remembers what my hands forget.",
    voiceLineTransliterated: "\u0927\u093e\u0917\u093e \u0935\u094b \u092f\u093e\u0926 \u0915\u0930\u0924\u093e \u0939\u0948 \u091c\u094b \u0939\u093e\u0925 \u092d\u0942\u0932 \u091c\u093e\u0924\u0947 \u0939\u0948\u0902\u0964",
    story: `Lakshmi learned to weave at her mother's knee, watching the shuttle catch afternoon light in the courtyard of Ahilyabai Holkar's fort. She was seven. Now, at 52, she runs a small cooperative of eleven women in Maheshwar's weaver's quarter -- a cluster of low-roofed houses where the sound of looms begins before dawn prayer and stops only after dinner. Her Maheshwari sarees are known for a particular quality of shine: not the blinding brightness of synthetic silk, but the warm luminescence of a lamp in a clay pot. "Silk must breathe," she says. "If it is too perfect, it has no life."`,
    personal: `On Sundays, Lakshmi tends a small jasmine garden. She says the flowers teach her about borders -- "how they should smell before they look."`,
    prideNote: `A cream-and-crimson bridal Maheshwari she wove for her youngest daughter's wedding in 2019. "I cried into that cloth for three nights. The salt changed the dye a little. I kept it."`,
    portrait: "https://images.unsplash.com/photo-1595956553066-fe24a8c33395?auto=format&fit=crop&q=80&w=800",
    sareeImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200",
    categoryFilter: "Silk",
    slug: "lakshmi-maheshwar",
  },
  {
    id: "rukmabai-pochampally",
    name: "Rukmabai Yellaiah",
    nameDevanagari: "\u0930\u0941\u0915\u094d\u092e\u093e\u092c\u093e\u0908 \u092f\u0947\u0932\u094d\u0932\u0948\u092f\u093e",
    age: 67,
    village: "Pochampally",
    district: "Yadadri Bhuvanagiri",
    state: "Telangana",
    region: "Telangana Heartland",
    craft: "Pochampally Ikat",
    craftDevanagari: "\u092a\u094b\u091a\u092e\u092a\u0932\u094d\u0932\u0940 \u0907\u0915\u0924",
    daysWoven: 63,
    voiceLine: "I dye the thread before I know the pattern. The pattern reveals itself to me.",
    voiceLineTransliterated: "\u0930\u0902\u0917\u0941 \u092e\u0941\u0902\u0926\u0941, \u0928\u092e\u0942\u0928\u093e \u0924\u0930\u094d\u0939\u093e\u0926 \u0935\u0938\u094d\u0924\u0941\u0902\u0926\u093f.",
    story: `Pochampally Ikat is resist-dyed before weaving -- the artisan must see the finished cloth in her mind months before the shuttle ever moves. Rukmabai has been doing this for fifty years. Her family has woven Ikat in Pochampally for four generations; her great-grandmother sold sarees at the Hyderabad Nizam's court. Rukmabai is one of the few remaining weavers who still performs the traditional "tying" by memory, without paper diagrams. Her sarees have a signature quality: the blurred halos at pattern edges that Ikat is famous for are, in her work, perfectly calibrated -- neither too sharp nor too dissolved. "That blur is the soul of the cloth," she says. "It tells you: a human hand made this."`,
    personal: `Rukmabai wakes at 4 AM to dye yarn before the heat makes the colors run. She has never owned a television. Her grandchildren bring her WhatsApp videos of her sarees on fashion runways in Mumbai. She watches, nodding, then goes back to her loom.`,
    prideNote: `A deep midnight-blue Ikat with geometric patterns that a fashion journalist called "Rothko in six yards." Rukmabai didn't know who Rothko was. When she was told, she laughed for a long time.`,
    portrait: "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?auto=format&fit=crop&q=80&w=800",
    sareeImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200",
    categoryFilter: "Festive",
    slug: "rukmabai-pochampally",
  },
  {
    id: "kamala-varanasi",
    name: "Kamala Ansari",
    nameDevanagari: "\u0915\u092e\u0932\u093e \u0905\u0902\u0938\u093e\u0930\u0940",
    age: 44,
    village: "Varanasi Old City",
    district: "Varanasi",
    state: "Uttar Pradesh",
    region: "Kashi, UP",
    craft: "Banarasi Silk",
    craftDevanagari: "\u092c\u0928\u093e\u0930\u0938\u0940 \u0930\u0947\u0936\u092e",
    daysWoven: 31,
    voiceLine: "Banaras has been weaving since before it had a name.",
    voiceLineTransliterated: "\u092c\u0928\u093e\u0930\u0938 \u0915\u093e \u0915\u094b\u0908 \u0928\u093e\u092e \u0939\u094b\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u092d\u0940 \u092c\u0941\u0928\u093e\u0908 \u0939\u094b\u0924\u0940 \u0925\u0940\u0964",
    story: `Kamala is the only woman jacquard-master weaver in her mohalla. In a craft traditionally dominated by men, she trained herself on her father-in-law's loom after he fell ill, learning by watching and touch. Her Banarasi sarees use zari -- gold and silver thread -- in patterns passed down in her husband's family for two hundred years. The patterns live in paper punchcards stacked ceiling-high in a back room. Each card represents one row of weaving. A single Banarasi saree can have 5,000 such cards. "Every morning," she says, "I talk to the cards. I ask them what they want to say today."`,
    personal: `Kamala's daughter is studying computer science in Lucknow. When she comes home for Eid, she photographs her mother's hands. She has 3,000 photographs of those hands. "Someday," the daughter told us, "I want to train an AI on her patterns." Kamala said: "If it learns to feel the weight of the thread, maybe."`,
    prideNote: `A red-and-gold Banarasi she wove for a bride in Delhi who wept when she first draped it. "She said it smelled like my grandmother's house. I had never met her grandmother. But cloth knows things."`,
    portrait: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=800",
    sareeImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=1200",
    categoryFilter: "Bridal",
    slug: "kamala-varanasi",
  },
];

export function getStoryById(id: string): ArtisanStory | undefined {
  return artisanStories.find((s) => s.id === id);
}

export function getStoriesForCategory(category: string): ArtisanStory[] {
  return artisanStories.filter((s) => s.categoryFilter === category);
}
