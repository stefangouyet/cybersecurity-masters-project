'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './../../globals.css';

export default function Header() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="nav-logo">Firestore Rules Toolkit</div>
            <div className="nav-links">
                <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
                <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            </div>
        </nav>
    );
}
