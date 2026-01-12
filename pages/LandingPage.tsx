import React from 'react';
import { Car, Wrench, Shield, Clock, Star, Phone, MapPin, Mail } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Biskaken Auto</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">Contact</a>
            </nav>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Book Service
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Ghana's Premier Auto Repair Shop
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Professional automotive services you can trust. Expert technicians, quality parts, and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
                Schedule Repair
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                Call Now: +233 XX XXX XXXX
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Expert Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From routine maintenance to complex repairs, we provide comprehensive automotive services for all vehicle types.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Wrench className="h-12 w-12 text-blue-600" />,
                title: "Engine Repair & Maintenance",
                description: "Complete engine diagnostics, repairs, and preventive maintenance to keep your vehicle running smoothly."
              },
              {
                icon: <Shield className="h-12 w-12 text-blue-600" />,
                title: "Brake System Services",
                description: "Comprehensive brake inspections, pad replacements, and system repairs for your safety on Ghana's roads."
              },
              {
                icon: <Car className="h-12 w-12 text-blue-600" />,
                title: "Transmission Services",
                description: "Expert transmission repair, maintenance, and fluid changes for manual and automatic systems."
              },
              {
                icon: <Clock className="h-12 w-12 text-blue-600" />,
                title: "Quick Oil Changes",
                description: "Fast, professional oil changes with quality lubricants suitable for Ghana's tropical climate."
              },
              {
                icon: <Star className="h-12 w-12 text-blue-600" />,
                title: "AC System Repair",
                description: "Essential air conditioning services to keep you cool in Ghana's hot weather conditions."
              },
              {
                icon: <Wrench className="h-12 w-12 text-blue-600" />,
                title: "Electrical Systems",
                description: "Complete electrical diagnostics and repairs for modern vehicle electronic systems."
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Trusted Auto Repair in Ghana
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                With over 15 years of experience serving the automotive needs of Ghana, 
                Biskaken Auto has built a reputation for reliable, honest, and professional service.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Licensed & Insured</p>
                    <p className="text-gray-600">Fully certified technicians</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">5-Star Service</p>
                    <p className="text-gray-600">Customer satisfaction guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Quick Turnaround</p>
                    <p className="text-gray-600">Efficient service delivery</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Quality Parts</p>
                    <p className="text-gray-600">OEM and premium aftermarket</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-100 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Expert diagnostics using modern equipment</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Transparent pricing with no hidden costs</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Warranty on all repairs and services</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Convenient location in central Ghana</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Emergency roadside assistance available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Us Today
            </h2>
            <p className="text-lg text-gray-600">
              Ready to get your vehicle serviced? Reach out to schedule an appointment.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">Get immediate assistance</p>
              <p className="text-blue-600 font-semibold">+233 XX XXX XXXX</p>
              <p className="text-gray-500 text-sm">Mon-Sat: 8AM-6PM</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Our service center</p>
              <p className="text-blue-600 font-semibold">Central Location</p>
              <p className="text-gray-500 text-sm">Accra, Ghana</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">Send us a message</p>
              <p className="text-blue-600 font-semibold">info@biskakenauto.com</p>
              <p className="text-gray-500 text-sm">24/7 Support</p>
            </div>
          </div>
          
          <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Schedule Your Service?
            </h3>
            <p className="text-blue-100 mb-6">
              Book your appointment online or call us directly. We're here to keep your vehicle running smoothly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
                Schedule Online
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                Call +233 XX XXX XXXX
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Biskaken Auto</span>
              </div>
              <p className="text-gray-300 mb-4">
                Ghana's trusted automotive repair and maintenance service provider. 
                Professional, reliable, and committed to your vehicle's performance.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-300 hover:text-white">WhatsApp</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Engine Repair</a></li>
                <li><a href="#" className="hover:text-white">Brake Service</a></li>
                <li><a href="#" className="hover:text-white">Oil Changes</a></li>
                <li><a href="#" className="hover:text-white">AC Repair</a></li>
                <li><a href="#" className="hover:text-white">Diagnostics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>+233 XX XXX XXXX</li>
                <li>info@biskakenauto.com</li>
                <li>Accra, Ghana</li>
                <li>Mon-Sat: 8AM-6PM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Biskaken Auto. All rights reserved. Professional automotive services in Ghana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;