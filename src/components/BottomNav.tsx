'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/tunnels', icon: Network, label: 'Tunnels' },
  { href: '/applications', icon: Shield, label: 'Apps' },
  { href: '/gateway', icon: Settings, label: 'Gateway' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center touch-target flex-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
