import { describe, expect, it } from 'vitest';
import { getMcpCapabilities } from '../../src/lib/mcp/capabilities';
import { createEmptyResume } from '../../src/lib/domain/resumeFactory';
import { auditResume } from '../../src/lib/domain/ats';
import { resumeDocumentSchema } from '../../src/lib/mcp/schema/resume';

describe('MCP foundations', () => {
  it('creates a schema-valid empty resume', () => {
    const resume = createEmptyResume();
    const parsed = resumeDocumentSchema.safeParse(resume);

    expect(parsed.success).toBe(true);
    expect(resume.version).toBe(1);
    expect(resume.content.schemaVersion).toBe(1);
  });

  it('reports capabilities', () => {
    const capabilities = getMcpCapabilities();

    expect(capabilities.sections).toContain('experience');
    expect(capabilities.layouts).toContain('standard-ats-v1');
  });

  it('audits a blank resume', () => {
    const result = auditResume(createEmptyResume());

    expect(result.score).toBeLessThan(100);
    expect(result.issues.some((issue) => issue.code === 'header.name.placeholder')).toBe(true);
  });
});
