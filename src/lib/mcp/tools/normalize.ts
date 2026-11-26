import { bulletsToHtml, plainTextToHtml } from '../../domain/html';

export const normalizeBullets = (
  input: string[] | string | undefined
): string | undefined => {
  if (input === undefined) return undefined;
  const bullets = Array.isArray(input) ? input : input.split(/\n+/);
  return bulletsToHtml(bullets);
};

export const normalizeText = (input: string | undefined): string | undefined =>
  input === undefined ? undefined : plainTextToHtml(input);

export const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};
