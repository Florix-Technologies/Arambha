"use client";
import Link from 'next/link';
import { whatsappUrl } from '@/lib/whatsapp';
import { BUSINESS } from '@/lib/seo';
import { track } from '@/lib/track';
import styles from '@/components/catalog/Catalog.module.css';

type Props = {
  /** Pre-filled WhatsApp text, e.g. the product being asked about. */
  message?: string;
  /** Where the buttons sit, sent with the tracking events. */
  placement: string;
  className?: string;
};

/** Call, WhatsApp and Book-a-consultation buttons that report clicks to GA when it is loaded. */
export default function ContactActions({ message = 'Hi, I am interested in interior design services from Arambha.', placement, className }: Props) {
  return (
    <div className={`${styles.actions} ${className ?? ''}`}>
      <a href={`tel:${BUSINESS.phone.replace(/-/g, '')}`} className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => track('click_call', { placement })}>Call us</a>
      <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={styles.btn} onClick={() => track('click_whatsapp', { placement })}>WhatsApp</a>
      <Link href="/contact" className={styles.btn} onClick={() => track('click_enquiry', { placement })}>Book a consultation</Link>
    </div>
  );
}
