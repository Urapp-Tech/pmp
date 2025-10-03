import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import assets from '@/assets/images';
import { useSelector } from 'react-redux';

type Props = {
  customClass?: string;
};

export default function Header({ customClass }: Props) {
  const authState: any = useSelector((state: any) => state.authState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    if (!authState.user) {
      setIsLogin(true);
    }
  });
  return (
    <header
      className={`absolute top-0 z-[111] w-full py-4 bg-neutral-400/20 backdrop-blur-[5px] ${
        customClass || ''
      }`}
    >
      <div className="max-w-full mx-auto px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={assets.images.darklogo}
                alt="Logo"
                className="w-[105px] h-[20px] object-contain"
                width={105}
                height={20}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <ul className="flex gap-8 items-center text-[20px] font-light text-primary">
              <li>
                <Link to="/features" className="hover:opacity-90">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:opacity-90">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:opacity-90">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:opacity-90">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop Login */}
          {isLogin ? (
            <div className="hidden md:flex items-center justify-end">
              <Link
                to="/admin-panel/auth/login"
                className="text-[20px] font-light no-underline text-primary hover:underline"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-end">
              <Link
                to="/admin-panel/dashboard"
                className="text-[20px] font-light no-underline text-primary hover:underline"
              >
                Dashboard
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <span className="text-2xl">✖</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 border-t border-gray-200 pt-4">
            <ul className="flex flex-col gap-4 text-[20px] font-light text-primary">
              <li>
                <Link to="/features" className="hover:opacity-90">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:opacity-90">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:opacity-90">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:opacity-90">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-panel/auth/login"
                  className="text-primary hover:underline"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
