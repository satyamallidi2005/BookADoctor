import React from 'react';

const SectionTitle = ({ title, subtitle, align = 'center', className = '' }) => {
  const alignmentClass = align === 'left' ? 'text-left' : 'text-center';
  const marginClass = align === 'left' ? '' : 'mx-auto';

  return (
    <div className={`mb-8 max-w-3xl ${alignmentClass} ${marginClass} ${className}`}>
      {subtitle && (
        <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
          {subtitle}
        </span>
      )}
      <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;
