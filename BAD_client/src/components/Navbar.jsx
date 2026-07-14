import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './common/Logo';
import Container from './common/Container';
import Button from './common/Button';
import { useAuth } from '../hooks/useAuth';
import { NAV_LINKS } from '../constants/constants';

/**
 * Public Header Navigation component.
 * Displays identical layout with or without login session.
 * Automatically forwards authenticated users to their roles' dashboard pages when clicking Login/Register.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getLoginRedirectPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  const getRegisterRedirectPath = () => {
    if (!user) return '/register';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  const activeStyle = ({ isActive }) => 
    `text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
    }`;

  const handleContactClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === '/') {
      const footer = document.getElementById('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#footer');
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-150 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              if (link.label === 'Contact') {
                return (
                  <a
                    key={link.label}
                    href="#footer"
                    onClick={handleContactClick}
                    className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                );
              }
              if (link.label === 'About') {
                return (
                  <a
                    key={link.label}
                    href="#"
                    onClick={handleAboutClick}
                    className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <NavLink key={link.path} to={link.path} className={activeStyle}>
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={getLoginRedirectPath()}>
              <Button variant="secondary" size="sm">Login</Button>
            </Link>
            <Link to={getRegisterRedirectPath()}>
              <Button variant="primary" size="sm">Register</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isOpen}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_LINKS.map((link) => {
              if (link.label === 'Contact') {
                return (
                  <a
                    key={link.label}
                    href="#footer"
                    onClick={handleContactClick}
                    className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    {link.label}
                  </a>
                );
              }
              if (link.label === 'About') {
                return (
                  <a
                    key={link.label}
                    href="#"
                    onClick={handleAboutClick}
                    className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-base font-semibold ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              );
            })}
            
            <hr className="my-3 border-gray-100" />
            
            <div className="px-3">
              <div className="flex flex-col gap-2">
                <Link to={getLoginRedirectPath()} onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="secondary" size="md" className="w-full">Login</Button>
                </Link>
                <Link to={getRegisterRedirectPath()} onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" size="md" className="w-full">Register</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
