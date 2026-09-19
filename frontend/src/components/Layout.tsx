import React from 'react';

interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex w-full h-full ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
