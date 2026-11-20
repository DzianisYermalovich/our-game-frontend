// PROTOTYPE (decision ticket 04, throwaway): shared variant vocabulary for the IA
// prototype. Types only — variants deliberately share no layout code.

export type VariantKey = 'A' | 'B' | 'C';

export interface VariantDescriptor {
  readonly key: VariantKey;
  readonly name: string;
}

export const VARIANT_DESCRIPTORS: readonly VariantDescriptor[] = [
  { key: 'A', name: 'Прихожая' },
  { key: 'B', name: 'Картотека' },
  { key: 'C', name: 'Игровая' },
];
