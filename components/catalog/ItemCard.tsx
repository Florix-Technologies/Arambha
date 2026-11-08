"use client";
import type { CSSProperties } from 'react';
import CatalogMedia from '@/components/ui/CatalogMedia';
import { productInquiryMessage, whatsappUrl } from '@/lib/whatsapp';
import { track } from '@/lib/track';
import interiorsStyles from '@/app/(site)/interiors/page.module.css';
import furnitureStyles from '@/app/(site)/furniture/page.module.css';
import galleryStyles from '@/app/(site)/gallery/page.module.css';

export type ItemCardData = {
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
};

type CardProps = {
  item: ItemCardData;
  onOpen?: () => void;
  selected?: boolean;
  /** The admin's preview: looks identical, but the WhatsApp button goes nowhere. */
  preview?: boolean;
};

const FILL_CARD: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const PRICE_STYLE: CSSProperties = { fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-accent-dark)', marginTop: '0.5rem' };
const WHATSAPP_STYLE: CSSProperties = {
  display: 'inline-block',
  marginTop: '0.75rem',
  padding: '0.5rem 1.2rem',
  background: 'var(--color-text-secondary)',
  color: '#fff',
  borderRadius: '0.5rem',
  fontWeight: 500,
  textDecoration: 'none',
  fontSize: '1rem',
};

export const formatPrice = (price: number) => `₹ ${Number(price).toLocaleString('en-IN')}`;

function WhatsAppButton({ intro, item, includeImage, preview }: { intro: string; item: ItemCardData; includeImage: boolean; preview?: boolean }) {
  const message = productInquiryMessage(intro, includeImage ? item : { ...item, image_url: null });
  return (
    <a
      href={preview ? '#' : whatsappUrl(message)}
      target={preview ? undefined : '_blank'}
      rel="noopener noreferrer"
      style={WHATSAPP_STYLE}
      onClick={(event) => {
        event.stopPropagation();
        if (preview) event.preventDefault();
        else track('click_whatsapp', { placement: 'product-card' });
      }}
    >
      Place Order on WhatsApp
    </a>
  );
}

export function InteriorsItemCard({ item, onOpen, selected, preview }: CardProps) {
  const styles = interiorsStyles;
  return (
    <div
      className={styles.card}
      onClick={onOpen}
      style={{ cursor: 'pointer', border: selected ? '2px solid var(--color-accent)' : undefined }}
    >
      <div className={styles.imagePlaceholder}>
        {item.image_url ? <CatalogMedia src={item.image_url} alt={item.name} style={FILL_CARD} /> : item.name}
      </div>
      <div className={styles.cardContent}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        {item.price != null && <p style={PRICE_STYLE}>{formatPrice(item.price)}</p>}
        <WhatsAppButton
          intro="Hello, I am interested in buying the following product:"
          item={item}
          includeImage={false}
          preview={preview}
        />
      </div>
    </div>
  );
}

export function FurnitureItemCard({ item, onOpen, preview }: CardProps) {
  const styles = furnitureStyles;
  return (
    <div className={styles.card} onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div className={styles.imagePlaceholder}>
        {item.image_url ? <CatalogMedia src={item.image_url} alt={item.name} style={FILL_CARD} /> : item.name}
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.productName}>{item.name}</h3>
        <p className={styles.productDesc}>{item.description}</p>
        {item.price != null && <p style={PRICE_STYLE}>{formatPrice(item.price)}</p>}
        <WhatsAppButton
          intro="Hello, I am interested in buying the following product from your Furniture collection:"
          item={item}
          includeImage
          preview={preview}
        />
      </div>
    </div>
  );
}

export function GalleryItemMedia({ src, alt }: { src: string; alt: string }) {
  return <CatalogMedia src={src} alt={alt} className={galleryStyles.media} />;
}

/** The Gallery's card as visitors see it, for the admin's preview. The Gallery page animates its own wrapper. */
export function GalleryItemCard({ item }: CardProps) {
  return (
    <div className={galleryStyles.card}>
      {item.image_url && <GalleryItemMedia src={item.image_url} alt={item.name} />}
    </div>
  );
}
