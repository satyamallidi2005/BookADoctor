import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Logo = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md transition-transform group-hover:scale-105 duration-200">
        <Stethoscope className="w-6 h-6" />
      </div>
      <span className="text-xl font-bold tracking-tight text-gray-900">
        Book<span className="text-blue-600">a</span>Doctor
      </span>
    </Link>
  );
};

export default Logo;
