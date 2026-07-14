import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Centered Authentication Layout.
 * Excludes Navbar and Footer for clean focus on Login/Registration.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
