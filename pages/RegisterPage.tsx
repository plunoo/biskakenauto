import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { UserPlus, Phone, Mail, MapPin, Car } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    vehicleInfo: '',
    serviceType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Customer registration:', formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in Biskaken Auto services. Our team will contact you within 24 hours to discuss your vehicle needs and schedule your first service.
          </p>
          <div className="space-y-3">
            <Link to="/landing">
              <Button className="w-full">Back to Homepage</Button>
            </Link>
            <p className="text-sm text-gray-500">
              Need immediate assistance? Call us at +233 XX XXX XXXX
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">B</div>
          <h1 className="text-2xl font-bold text-gray-900">Get Started with Biskaken</h1>
          <p className="text-gray-600">Register for professional auto repair services in Ghana</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              name="name"
              placeholder="Your full name" 
              value={formData.name}
              onChange={handleInputChange}
              required
              icon={UserPlus}
            />
            <Input 
              label="Phone Number" 
              name="phone"
              placeholder="+233 XX XXX XXXX" 
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              icon={Phone}
            />
          </div>

          <Input 
            label="Email Address" 
            name="email"
            placeholder="your.email@example.com" 
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            icon={Mail}
          />

          <Input 
            label="Location" 
            name="location"
            placeholder="City/Area (e.g., Accra, Kumasi)" 
            value={formData.location}
            onChange={handleInputChange}
            required
            icon={MapPin}
          />

          <Input 
            label="Vehicle Information" 
            name="vehicleInfo"
            placeholder="Make, Model, Year (e.g., Toyota Corolla 2018)" 
            value={formData.vehicleInfo}
            onChange={handleInputChange}
            icon={Car}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Service Needed</label>
            <select 
              name="serviceType"
              className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.serviceType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a service</option>
              <option value="general-maintenance">General Maintenance</option>
              <option value="engine-repair">Engine Repair</option>
              <option value="brake-service">Brake Service</option>
              <option value="transmission">Transmission Service</option>
              <option value="ac-repair">AC Repair</option>
              <option value="oil-change">Oil Change</option>
              <option value="electrical">Electrical Issues</option>
              <option value="diagnostic">Vehicle Diagnostic</option>
              <option value="emergency">Emergency Repair</option>
              <option value="other">Other (specify in message)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Details (Optional)</label>
            <textarea 
              name="message"
              className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your vehicle issues or any specific requirements..."
              value={formData.message}
              onChange={handleInputChange}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Our team will review your request within 24 hours</li>
              <li>• We'll call you to discuss your vehicle needs</li>
              <li>• Schedule a convenient appointment time</li>
              <li>• Get a cost estimate before any work begins</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            icon={UserPlus}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Register for Service'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link to="/landing" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Homepage
          </Link>
          
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-500">
              Already a customer or staff member?
            </p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Login →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;