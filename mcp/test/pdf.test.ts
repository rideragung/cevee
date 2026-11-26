import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { extractTextFromPdfBytes } from '../../src/lib/pdf/extractTextNode';

describe('PDF text extraction', () => {
  it('extracts text from a real PDF', async () => {
    const bytes = new Uint8Array(
      await readFile(new URL('./fixtures/sample.pdf', import.meta.url))
    );
    const result = await extractTextFromPdfBytes(bytes);

    expect(result.pageCount).toBe(1);
    expect(result.text).toContain('Sample PDF');
  });
});
