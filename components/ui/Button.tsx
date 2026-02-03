import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'text';
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  href, 
  className = '',
  onClick,
  type = 'button'
}: ButtonProps) {
  const rootClassName = `${styles.button} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={rootClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={rootClassName} onClick={onClick}>
      {children}
    </button>
  );
}
