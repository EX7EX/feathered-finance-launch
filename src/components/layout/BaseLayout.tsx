import { Link, useLocation } from 'react-router-dom';
import styles from './BaseLayout.module.css';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link to="/">
            <span>Feathered Finance</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link to="/launchpad" className={location.pathname === '/launchpad' ? styles.active : ''}>
            Launchpad
          </Link>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? styles.active : ''}>
            Dashboard
          </Link>
          <Link to="/tokens" className={location.pathname === '/tokens' ? styles.active : ''}>
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
            <Link to="/about">About</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/support">Support</Link>
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
