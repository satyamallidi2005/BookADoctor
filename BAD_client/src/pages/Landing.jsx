import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  User, 
  MapPin, 
  DollarSign, 
  Award
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';
import FeatureCard from '../components/FeatureCard';
import { FEATURES, HOW_IT_WORKS_STEPS } from '../constants/constants';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import heroImg from '../assets/hero.png';

/**
 * Public Landing Page.
 * Displays hero illustration, services, dynamic available doctors list, and process walkthrough steps.
 */
const Landing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await authService.getAvailableDoctors();
        if (response.success && response.data) {
          setDoctors(response.data);
        } else {
          setError(response.message || 'Failed to fetch doctors.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading available doctors.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-28 xl:pb-32 bg-linear-to-b from-blue-50/50 to-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                Your Health, Our Priority
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Find and Book the <span className="text-blue-600">Best Doctors</span> Near You
              </h1>
              
              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with highly qualified medical professionals. Schedule real-time appointments, access secure consultation records, and manage your health journey effortlessly.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to={getRegisterRedirectPath()}>
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg flex items-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to={getLoginRedirectPath()}>
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Book Appointment
                  </Button>
                </Link>
              </div>

              {/* Social proof/Stats placeholder */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Secure & Compliant</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image Illustration */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-md xl:max-w-lg aspect-square">
                {/* Decorative gradients */}
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-400/20 rounded-full filter blur-3xl opacity-70 animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-400/10 rounded-full filter blur-3xl opacity-70" />
                
                {/* Main Image Frame */}
                <div className="relative bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden p-4 group transition-transform duration-500 hover:scale-[1.02]">
                  {heroImg ? (
                    <img 
                      src={heroImg} 
                      alt="Healthcare Illustration" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center rounded-2xl">
                      <Heart className="w-20 h-20 text-blue-300 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="pt-10 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 xl:pb-28 bg-gray-50">
        <Container>
          <SectionTitle
            subtitle="Our Features"
            title="Premium Healthcare Services Built For You"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 lg:gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                iconName={feature.iconName}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="pt-10 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 xl:pb-28 bg-gray-50">
        <Container>
          <SectionTitle
            subtitle="How It Works"
            title="Get Care in 3 Simple Steps"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step cards */}
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={step.step} className="relative z-10">
                <FeatureCard
                  title={step.title}
                  description={step.description}
                  iconName={step.iconName}
                  step={step.step}
                  className="h-full border border-gray-100 shadow-xs"
                />
                
                {/* Connector Arrow (Desktop only) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[105%] w-[10%] h-0.5 border-t-2 border-dashed border-gray-250 z-0" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Booking CTA Section */}
      <section className="pt-10 sm:pt-12 lg:pt-14 pb-16 lg:pb-20 xl:pb-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-50 -mr-20 -mt-20" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Ready to find your doctor?
          </h2>
          <p className="text-lg text-blue-100">
            Join thousands of patients who trust Book a Doctor with their healthcare management. Sign up for an account now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to={getRegisterRedirectPath()}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold text-blue-600 hover:text-blue-750 bg-white hover:bg-blue-50">
                Create Free Account
              </Button>
            </Link>
            <Link to={getLoginRedirectPath()}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-blue-700">
                Login Today
              </Button>
            </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Landing;
