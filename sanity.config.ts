import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';
import { projectId, dataset } from './sanity/env';

export default defineConfig({
  basePath: '/studio',
  name: 'Hemasaree_Content_Studio',
  title: 'Hemasaree Content Studio',
  projectId,
  dataset,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
