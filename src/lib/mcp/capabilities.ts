import { LAYOUT_CATALOG_LIST } from '../../layouts/catalog';
import { RESUME_SCHEMA_VERSION } from '../domain/resumeFactory';

export const MCP_SERVER_VERSION = '0.1.0';

export const MCP_SECTION_PRESETS = [
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'certifications',
  'languages',
  'publications',
  'awards',
  'volunteering',
  'references',
  'custom',
] as const;

export interface McpCapabilities {
  serverVersion: string;
  schemaVersion: number;
  sections: readonly string[];
  layouts: readonly string[];
  features: {
    import: readonly string[];
    export: readonly string[];
    ai: readonly string[];
  };
  limits: {
    maxResumes: number;
    maxBulletsPerItem: number;
  };
}

export const getMcpCapabilities = (): McpCapabilities => ({
  serverVersion: MCP_SERVER_VERSION,
  schemaVersion: RESUME_SCHEMA_VERSION,
  sections: MCP_SECTION_PRESETS,
  layouts: LAYOUT_CATALOG_LIST.map((layout) => layout.id),
  features: {
    import: [],
    export: [],
    ai: [],
  },
  limits: {
    maxResumes: 200,
    maxBulletsPerItem: 20,
  },
});

export const MCP_CAPABILITIES = getMcpCapabilities();
