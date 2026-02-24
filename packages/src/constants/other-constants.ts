export const YesNo = ['Yes', 'No'] as const;

export const baseColor = '#ffffff';
export const defaultColors = [
  { name: 'White', value: baseColor },
  { name: 'Red', value: '#ff0000' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Gray', value: '#808080' },
];

export const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

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

export const orderStatus = ['paid', 'pending'] as const;
