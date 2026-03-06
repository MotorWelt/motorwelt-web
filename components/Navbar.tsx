// components/Navbar.tsx

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-100 dark:bg-gray-900 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold text-black dark:text-white">
          <Link href="/">MotorWelt</Link>
        </div>
        <div className="space-x-4 text-sm sm:text-base text-blue-600 dark:text-blue-400">
          <Link href="/noticias">Noticias</Link>
          <Link href="/producciones">Producciones</Link>
          <Link href="/comunidad">Comunidad</Link>
          <Link href="/tienda">Tienda</Link>
          <Link href="/suscribete">Suscríbete</Link>
          <Link href="/esen">ESEN</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
