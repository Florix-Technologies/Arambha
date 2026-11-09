export const WHATSAPP_NUMBER = '919187628243';

/** Pass plain text with real line breaks; the message is encoded here, once. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const formatPrice = (price: number) => `₹ ${Number(price).toLocaleString('en-IN')}`;

type OrderDetails = { product: string; collection: string; category: string; price?: number | null; url: string };

/** The customer's order enquiry, built from the real product; the price line appears only when a price is shown. */
export function productOrderMessage({ product, collection, category, price, url }: OrderDetails): string {
  return [
    'Hello Arambha Design & Interior Studio,',
    '',
    'I would like to enquire about ordering this product:',
    '',
    `Product: ${product}`,
    `Category: ${collection} / ${category}`,
    Number(price) > 0 ? `Price: ${formatPrice(Number(price))}` : null,
    `Product Link: ${url}`,
    '',
    'Please share availability and the next steps for placing my order.',
    '',
    'Thank you.',
  ].filter(line => line !== null).join('\n');
}
