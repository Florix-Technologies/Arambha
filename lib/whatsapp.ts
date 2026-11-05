export const WHATSAPP_NUMBER = '919187628243';

type InquiryProduct = {
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
};

/** Pass plain text with real line breaks; the message is encoded here, once. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productInquiryMessage(intro: string, product: InquiryProduct): string {
  return [
    intro,
    '',
    `Product: ${product.name}`,
    product.description ? `Description: ${product.description}` : null,
    product.price != null ? `Price: ${product.price}` : null,
    product.image_url ? `Image: ${product.image_url}` : null,
  ].filter((line) => line !== null).join('\n');
}
