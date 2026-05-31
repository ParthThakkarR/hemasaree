import type { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const collectionName = params.slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${collectionName} Collection | Hema Sarees`,
    description: `Explore the exquisite ${collectionName} collection by Hema Sarees. Premium quality, authentic craftsmanship, and beautiful designs.`,
    alternates: {
      canonical: `/collections/${params.slug}`,
    },
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
