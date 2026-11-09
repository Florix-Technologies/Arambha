"use client";
import { whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/track';

/** Opens WhatsApp (app on phones, WhatsApp Web/desktop on computers) with the order message filled in; the customer presses Send. */
export default function OrderOnWhatsApp({ message, placement, className }: { message: string; placement: string; className?: string }) {
  return (
    <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={className} onClick={() => track('click_whatsapp', { placement })}>
      Order Now on WhatsApp
    </a>
  );
}
