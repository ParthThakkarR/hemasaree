/**
 * lib/content/motifs.ts
 *
 * Motif folklore library.
 * When she taps a motif on the PDP, she gets the story.
 * The pattern is never just decoration -- it means something.
 */

export interface Motif {
  id: string;
  name: string;
  nameDevanagari: string;
  regions: string[];
  meaning: string;
  legend: string;
  symbolism: string;
  appearsIn: string[];
  symbol: string;
}

export const motifs: Motif[] = [
  {
    id: "peacock",
    name: "Peacock",
    nameDevanagari: "\u092e\u094b\u0930",
    regions: ["Kanjivaram", "Banarasi", "Paithani", "Madhubani"],
    meaning: "Immortality. The dance that calls the rain.",
    legend:
      "In the Mahabharata, the peacock was the messenger between heaven and earth. Its tail -- a thousand eyes -- was said to be the gaze of all the gods at once. Sadhus embroidered it facing east, where dawn breaks.",
    symbolism:
      "Wearing the peacock is wearing the wish for renewal. It says: I am not finished becoming.",
    appearsIn: ["Bridal", "Silk", "Festive"],
    symbol: "\ud83e\udd9a",
  },
  {
    id: "mango-paisley",
    name: "Mango Paisley",
    nameDevanagari: "\u0915\u0948\u0930\u0940 / \u092c\u0942\u091f\u093e",
    regions: ["Banarasi", "Maheshwari", "Kashmiri", "Kanjivaram"],
    meaning: "Fertility. The tree that gives without asking.",
    legend:
      "The mango-shaped buti arrived in Indian weaving from Persia, where it was called 'boteh' -- a flame or a leaf. Indian weavers bent it into the curve of a pregnant belly, a ripening mango. It became a blessing. In Kashmir, a bride's pheran was sewn with 108 bootis -- one for each name of the divine.",
    symbolism:
      "The paisley says: may you be abundant. May your life curve toward sweetness.",
    appearsIn: ["Casual", "Festive", "Bridal", "Silk"],
    symbol: "\ud83e\udd6d",
  },
  {
    id: "lotus",
    name: "Lotus",
    nameDevanagari: "\u0915\u092e\u0932",
    regions: ["Kanjivaram", "Odisha", "Assam", "Phulkari"],
    meaning: "Rising from still water. Being born again and again.",
    legend:
      "The lotus grows in mud and blooms untouched. In the Puranas, the universe itself was a lotus that bloomed from Vishnu's navel. Lakshmi -- the goddess of wealth -- stands on its petals because she never needs the ground to hold her.",
    symbolism:
      "To wear the lotus is to say: I have been in difficult places. I rose anyway.",
    appearsIn: ["Bridal", "Silk", "Festive"],
    symbol: "\ud83e\udeb7",
  },
  {
    id: "elephant",
    name: "Elephant",
    nameDevanagari: "\u0917\u091c",
    regions: ["Kerala", "Kanjivaram", "Banarasi"],
    meaning: "Steadiness. Memory. The guardian who never forgets a kindness.",
    legend:
      "Ganesha is the elephant-headed remover of obstacles. But before temples, before gods -- there were just elephants, moving through forests, knowing the paths that humans had not found yet. Kerala's temple sarees border the elephant to honor this original knowledge.",
    symbolism:
      "Wearing the elephant: I am strong in ways you cannot see. I do not forget what matters.",
    appearsIn: ["Silk", "Festive"],
    symbol: "\ud83d\udc18",
  },
  {
    id: "temple-border",
    name: "Temple Border",
    nameDevanagari: "\u092e\u0902\u0926\u093f\u0930 \u092c\u0949\u0930\u094d\u0921\u0930",
    regions: ["Kanjivaram", "Chettinad", "Gadwal"],
    meaning: "Sacred geometry. The architecture of devotion.",
    legend:
      "The gopuram-shaped border on a Kanjivaram saree repeats the triangular towers of South Indian temples in miniature. To wear it is to carry a temple on your hem. Women wore it to cross thresholds: into marriage, into motherhood, into widowhood. The border said: this is a sacred passage.",
    symbolism:
      "The temple border asks nothing of you -- it only blesses the ground beneath your feet.",
    appearsIn: ["Bridal", "Silk"],
    symbol: "\ud83d\uded5",
  },
  {
    id: "rudraksha",
    name: "Rudraksha Bead",
    nameDevanagari: "\u0930\u0941\u0926\u094d\u0930\u093e\u0915\u094d\u0937",
    regions: ["Banarasi", "Sambalpuri"],
    meaning: "The eye of Rudra. Protection against what you cannot see coming.",
    legend:
      "Rudraksha beads grow on trees in Nepal and the Himalayas. Shiva is said to have wept for the suffering of humanity; where his tears fell, rudraksha trees grew. The bead in weaving carries this -- a small, physical prayer knotted into the cloth.",
    symbolism:
      "To wear the rudraksha pattern: I carry my protection with me. I trust in what holds.",
    appearsIn: ["Festive", "Silk"],
    symbol: "\ud83e\udeac",
  },
];

export function getMotifById(id: string): Motif | undefined {
  return motifs.find((m) => m.id === id);
}

export function getMotifsForCategory(category: string): Motif[] {
  return motifs.filter((m) => m.appearsIn.includes(category));
}
