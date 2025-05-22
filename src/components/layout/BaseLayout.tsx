import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './BaseLayout.module.css';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link href="/">
            <span>Feathered Finance</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link href="/launchpad" className={router.pathname === '/launchpad' ? styles.active : ''}>
            Launchpad
          </Link>
          <Link href="/dashboard" className={router.pathname === '/dashboard' ? styles.active : ''}>
            Dashboard
          </Link>
          <Link href="/tokens" className={router.pathname === '/tokens' ? styles.active : ''}>
            Tokens
          </Link>
        </div>
        <div className={styles.userSection}>
          <button className={styles.connectButton}>Connect Wallet</button>
        </div>
      </nav>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/support">Support</Link>
          </div>
          <div className={styles.socialLinks}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout; 