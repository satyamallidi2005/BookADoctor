import React from 'react';

/**
 * PageContainer — inner content wrapper for all dashboard pages.
 * Used inside PatientLayout and DoctorLayout (after the sidebar).
 *
 * Constrains page content so it never becomes unreadably wide on
 * 1440 / 1920 / 2560px screens, while still filling available space
 * on smaller viewports.
 */
const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-screen-xl mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
