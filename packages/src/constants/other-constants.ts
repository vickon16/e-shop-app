export const YesNo = ['Yes', 'No'] as const;

export const baseColor = '#ffffff';
export const defaultColors = [
  baseColor,
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#808080',
];

export const defaultSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '4XL',
] as const;

export const discountTypes = ['percentage', 'fixed'] as const;

export const AI_ENHANCEMENT_EFFECTS = [
  {
    label: 'Remove BG',
    effect: 'e-removedotbg',
  },
  {
    label: 'Drop Shadow',
    effect: 'e-dropshadow',
  },
  {
    label: 'Retouch',
    effect: 'e-retouch',
  },
  {
    label: 'Upscale',
    effect: 'e-upscale',
  },
];

export const ProductStatus = ['active', 'pending', 'draft'] as const;

export const paymentMethods = [
  { label: 'Online Payments', value: 'online-payments' },
  { label: 'Cash On Delivery', value: 'cash-on-delivery' },
];
