import React from 'react';

/**
 * Global container — constrains content to a max-width and applies
 * responsive horizontal padding across all breakpoints.
 * Works for the public landing pages and general shared sections.
 */
const Container = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
