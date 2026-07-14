import React from 'react';
import { 
  CalendarCheck, 
  Award, 
  ShieldCheck, 
  Clock, 
  Search, 
  CalendarDays, 
  Stethoscope 
} from 'lucide-react';

const iconMap = {
  CalendarCheck: CalendarCheck,
  Award: Award,
  ShieldCheck: ShieldCheck,
  Clock: Clock,
  Search: Search,
  CalendarDays: CalendarDays,
  Stethoscope: Stethoscope,
};

const FeatureCard = ({ title, description, iconName, step, className = '' }) => {
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${className}`}>
      
      {/* If it's a step, render numerical badge, else render icon */}
      {step ? (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
            {step}
          </div>
          {IconComponent && (
            <IconComponent className="w-6 h-6 text-blue-600/70" />
          )}
        </div>
      ) : (
        IconComponent && (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-5">
            <IconComponent className="w-6 h-6" />
          </div>
        )
      )}

      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-650">{description}</p>
    </div>
  );
};

export default FeatureCard;
