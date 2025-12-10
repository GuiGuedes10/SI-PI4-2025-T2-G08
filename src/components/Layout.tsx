import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative noise-overlay">
      {/* Holographic grid background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 230, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(0, 230, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>
      
      {/* Animated gradient background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 20% 50%, rgba(0, 230, 255, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 77, 158, 0.15) 0%, transparent 50%)`
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
