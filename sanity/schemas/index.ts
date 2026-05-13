export const schemaTypes = [
  {
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Site Title',
        type: 'string',
      },
      {
        name: 'description',
        title: 'Site Description',
        type: 'text',
      },
      {
        name: 'logo',
        title: 'Logo',
        type: 'image',
        options: { hotspot: true },
      },
      {
        name: 'heroBanner',
        title: 'Hero Banner',
        type: 'object',
        fields: [
          { name: 'title', type: 'string', title: 'Banner Title' },
          { name: 'subtitle', type: 'string', title: 'Banner Subtitle' },
          { name: 'image', type: 'image', title: 'Banner Image', options: { hotspot: true } },
        ],
      },
      {
        name: 'footerText',
        title: 'footer Text',
        type: 'string',
      },
    ],
  },
  {
    name: 'page',
    title: 'Static Pages',
    type: 'document',
    fields: [
      { name: 'title', type: 'string', title: 'Title' },
      { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' } },
      { name: 'content', type: 'array', title: 'Content', of: [{ type: 'block' }] },
    ],
  },
];
