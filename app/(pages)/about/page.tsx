import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { artisanStories } from '@/lib/content/stories';
import { ArrowRight, ShieldCheck, RotateCcw, Gem, BookOpen, Heart } from 'lucide-react';

async function getAboutPage() {
  if (!client) return null;
  try {
    return await client.fetch(`*[_type == "page" && slug.current == "about"][0]`);
  } catch {
    return null;
  }
}

const PROMISE_PILLARS = [
  {
    icon: Heart,
    title: 'Artisan Direct',
    body: 'We work directly with weaver cooperatives — no middlemen. More of what you pay reaches the hands that made it.',
  },
  {
    icon: ShieldCheck,
    title: 'Respect the Craft',
    body: "To honor the countless hours and devotion poured into each handwoven piece, we do not accept returns. Please purchase mindfully.",
  },
  {
    icon: Gem,
    title: 'Heirloom Quality',
    body: 'Every saree is woven to last decades. Some of our customers are gifting HemaSaree sarees to the next generation.',
  },
  {
    icon: BookOpen,
    title: 'Lifetime Care Guide',
    body: 'Every saree ships with a handwritten care note from the artisan who made it. The care guide arrives inside the muslin wrap, next to the saree.',
  },
] as const;

const TRANSFORMATION_STORIES = [
  {
    occasion: 'Her first Karva Chauth after moving abroad',
    feeling: 'Homesick, disconnected from her roots',
    outcome: 'She wore the Maheshwari silk on FaceTime with her mother. "For the first time in two years, I didn\'t feel far."',
    buyer: 'Priya R., London',
  },
  {
    occasion: 'Her daughter\'s engagement ceremony',
    feeling: 'Wanted to look like herself — not just a "mother of the bride"',
    outcome: 'She chose the Banarasi in deep teal. "The in-laws asked who made my saree. I gave them the artisan\'s name."',
    buyer: 'Savita M., Pune',
  },
  {
    occasion: 'First saree at her corporate presentation',
    feeling: 'Nervous about being "too traditional" in a boardroom',
    outcome: 'She wore the Pochampally Ikat. "My manager said I looked more confident than she\'d ever seen me. I was."',
    buyer: 'Ananya K., Bengaluru',
  },
];

export default async function AboutPage() {
  const page = await getAboutPage();

  // If Sanity has content, use it
  if (page?.content) {
    return (
      <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6">
              {page.title}
            </h1>
          </div>
          <div className="prose prose-lg max-w-none text-ink-muted">
            <PortableText value={page.content} />
          </div>
          <div className="mt-12 text-center">
            <Link href="/products" className="inline-flex items-center justify-center px-10 py-4 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-900 transition-colors shadow-lg text-lg">
              Explore Our Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full narrative fallback
  return (
    <div className="bg-surface min-h-screen">

      {/* ── Hero Chapter ── */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <Image
          src={artisanStories[0].sareeImage}
          alt="Lakshmi Devi weaving in Maheshwar"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(13,11,10,0.9) 0%, rgba(13,11,10,0.3) 50%, transparent 100%)'
        }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 pb-16">
          <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
            Our Story
          </p>
          <h1 className="font-serif text-white font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Where every thread begins.
          </h1>
          <p className="text-white/65 text-lg max-w-xl">
            A saree is not a garment. It is six yards of someone else&apos;s memory,
            passed into your hands.
          </p>
          <div className="mt-6 flex items-center gap-2 text-white/50 text-sm">
            <ShieldCheck size={14} className="text-accent" />
            All Sales Final · Artisan Direct · Genuine Handloom
          </div>
        </div>
      </section>

      {/* ── Origin Story ── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest mb-4">
                The Question That Started It
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">
                Why is it so hard to buy a saree you can trust?
              </h2>
              <div className="space-y-4 text-ink-muted leading-relaxed">
                <p>
                  HemaSaree was born from a frustration familiar to every woman who has
                  stood in a shop and wondered: is this real silk, or a convincing imitation?
                  Is the artisan fairly paid, or is there a long chain of middlemen between
                  her work and my wallet?
                </p>
                <p>
                  We went looking for answers. We found Lakshmi in Maheshwar, Rukmabai in
                  Pochampally, and Kamala in the lanes of Varanasi. We found cooperatives
                  of women who had been weaving for decades without a direct market for their
                  work.
                </p>
                <p className="font-medium text-ink">
                  HemaSaree is our answer to that question — a direct line from the loom
                  to your drape, with nothing hidden in between.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-story">
              <Image
                src={artisanStories[2].portrait}
                alt="Kamala Ansari — Banarasi silk artisan in Varanasi"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-950/80 to-transparent p-6">
                <p className="text-white font-serif font-bold">Kamala Ansari</p>
                <p className="text-white/60 text-sm">{artisanStories[2].craft} · {artisanStories[2].region}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Artisan Voices ── */}
      <section className="py-20 lg:py-28 bg-brand-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              The People Behind Your Saree
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Their hands. Their voice. Your saree.
            </h2>
            <p className="text-brand-100/50 max-w-xl mx-auto text-sm">
              Every HemaSaree saree is made by a named artisan in a named place. Not a
              factory floor. Not an anonymous supplier.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {artisanStories.map((story) => (
              <div
                key={story.id}
                className="bg-brand-900/60 rounded-2xl overflow-hidden border border-brand-800/30 hover:border-accent/30 transition-colors group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={story.portrait}
                    alt={`${story.name} — ${story.craft}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-accent text-[10px] font-bold uppercase tracking-wider">
                      {story.craft}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-serif font-bold text-white text-lg mb-0.5">
                    {story.name}
                  </p>
                  <p className="text-brand-100/50 text-xs mb-4">
                    {story.age} · {story.village}, {story.state}
                  </p>
                  <blockquote className="text-brand-100/75 text-sm italic leading-relaxed border-l-2 border-accent/40 pl-3">
                    &ldquo;{story.voiceLine}&rdquo;
                  </blockquote>
                  <p className="text-brand-100/35 text-xs mt-3">
                    {story.prideNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Transformations ── */}
      <section className="py-20 lg:py-28 bg-surface-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              Real Women. Real Occasions.
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">
              What happens when the right saree finds you.
            </h2>
            <p className="text-ink-muted max-w-xl mx-auto text-sm">
              These are not testimonials. These are the moments our customers told us about,
              unprompted, after their order arrived.
            </p>
          </div>
          <div className="space-y-6">
            {TRANSFORMATION_STORIES.map((story, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-paper border border-surface-subtle">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {story.buyer[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-ink-faint uppercase tracking-wider font-bold mb-1">
                      {story.occasion}
                    </p>
                    <p className="text-ink-muted text-sm italic mb-3">
                      Feeling: &ldquo;{story.feeling}&rdquo;
                    </p>
                    <blockquote className="text-ink text-base font-medium leading-relaxed border-l-3 border-accent pl-4">
                      {story.outcome}
                    </blockquote>
                    <p className="text-ink-faint text-xs mt-3">— {story.buyer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Promise ── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              Before You Buy
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-4">
              Four promises we keep. Every order.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROMISE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="bg-surface-muted rounded-2xl p-7 border border-surface-subtle">
                  <Icon size={28} className="text-accent mb-4" aria-hidden="true" />
                  <h3 className="font-serif text-xl font-bold text-ink mb-2">{pillar.title}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-brand-950 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Your occasion is waiting.
          </h2>
          <p className="text-brand-100/60 mb-8 text-lg">
            Find the saree that belongs to your story — not someone else&apos;s.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-accent text-brand-950 font-bold px-10 py-4 rounded-xl hover:bg-haldi-light transition-colors text-lg shadow-haldi"
          >
            Explore All Sarees <ArrowRight size={20} />
          </Link>
          <p className="text-brand-100/35 text-xs mt-6">
            All Sales Final · Artisan Direct · Every saree traced to its maker
          </p>
        </div>
      </section>

    </div>
  );
}
