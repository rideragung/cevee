import fs from 'node:fs/promises';
import path from 'node:path';
import { extractTextFromPdfBytes } from '../../src/lib/pdf/extractTextNode';

const MAX_BASE64_LENGTH = 20_000_000;

export const extractPdfTextFromBase64 = async (base64: string) => {
  const clean = base64.replace(/^data:application\/pdf;base64,/, '').trim();

  if (!clean) {
    throw new Error('pdfBase64 is empty.');
  }
  if (clean.length > MAX_BASE64_LENGTH) {
    throw new Error('PDF is too large for base64 import (max ~15 MB).');
  }

  return extractTextFromPdfBytes(new Uint8Array(Buffer.from(clean, 'base64')));
};

export const extractPdfTextFromFile = async (filePath: string) => {
  const resolved = path.resolve(filePath);

  if (path.extname(resolved).toLowerCase() !== '.pdf') {
    throw new Error('Only .pdf files can be imported.');
  }

  const buffer = await fs.readFile(resolved);
  return extractTextFromPdfBytes(new Uint8Array(buffer));
};
