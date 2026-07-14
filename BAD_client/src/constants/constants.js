export const APP_NAME = 'Book a Doctor';

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Doctors', path: '/doctors' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const FEATURES = [
  {
    id: 'easy-booking',
    title: 'Easy Appointment Booking',
    description: 'Book your doctor appointment in just a few clicks. No more long queues or waiting lines.',
    iconName: 'CalendarCheck'
  },
  {
    id: 'verified-doctors',
    title: 'Verified Doctors',
    description: 'All listed medical professionals are fully certified, verified, and screened for your safety.',
    iconName: 'Award'
  },
  {
    id: 'secure-records',
    title: 'Secure Medical Records',
    description: 'Your health data is safe with us. We use advanced encryption standards to guard your privacy.',
    iconName: 'ShieldCheck'
  },
  {
    id: '24-7-support',
    title: '24/7 Support',
    description: 'Our customer support team is available round the clock to help resolve any queries or issues.',
    iconName: 'Clock'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Search Doctor',
    description: 'Find trusted doctors by specialization, location, or rating easily.',
    iconName: 'Search'
  },
  {
    step: 2,
    title: 'Book Appointment',
    description: 'Select an available date and time slot that works best for you.',
    iconName: 'CalendarDays'
  },
  {
    step: 3,
    title: 'Visit Doctor',
    description: 'Get consults in person or online. Receive optimal healthcare solutions.',
    iconName: 'Stethoscope'
  }
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];
