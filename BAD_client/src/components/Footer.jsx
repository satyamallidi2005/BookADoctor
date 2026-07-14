import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Container from './common/Container';
import Logo from './common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-white border-t border-gray-150 text-gray-600">
      <Container className="py-10 sm:py-12 lg:py-16 xl:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 xl:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Logo />
            <p className="text-sm mt-3 text-gray-500 leading-relaxed">
              Making healthcare bookable, accessible, and simple. Find verified doctor profiles and book real-time appointments.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links Col */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm hover:text-blue-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/doctors" className="text-sm hover:text-blue-600 transition-colors">Search Doctors</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-blue-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-blue-600 transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Guidelines/Legal Col */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Legal & Privacy</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-blue-600 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-600 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-600 transition-colors">Patient Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-600 transition-colors">Help Center</a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>123 Medical Center Way, Suite 100, Healthcare City, HC 98765</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="tel:+15550199" className="hover:text-blue-600 transition-colors">(555) 019-9823</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:support@bookadoctor.com" className="hover:text-blue-600 transition-colors">support@bookadoctor.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-150 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} Book a Doctor. All rights reserved.</p>
          <p>Created by Senior React & UI/UX Architects.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
