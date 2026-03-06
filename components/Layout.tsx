import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <main className="flex-grow p-4">{children}</main>
      <footer className="p-4 bg-gray-200 dark:bg-gray-800 text-center">
        <p>© {new Date().getFullYear()} MotorWelt</p>
      </footer>
    </div>
  );
};

export default Layout;
