import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 text-center">
      <Container className="max-w-md">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
            <h2 className="text-xl font-bold text-gray-800">Page Not Found</h2>
            <p className="text-sm text-gray-550 max-w-xs mx-auto leading-relaxed">
              We couldn't find the page you are looking for. It might have been moved or deleted.
            </p>
          </div>

          <Link to="/" className="w-full">
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
