import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';
import { projectId, dataset } from './sanity/env';

const fallbackProjectId = projectId || 'missing-project-id';

export default defineConfig({
  basePath: '/studio',
  name: 'Hemasaree_Content_Studio',
  title: 'Hemasaree Content Studio',
  projectId: fallbackProjectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
