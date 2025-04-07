import { BookOpenIcon, UserGroupIcon, AcademicCapIcon, ArrowRightIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import Footer from '../components/Footer';
import PublicNavbar from '../components/PublicNavbar';
import { APP_NAME } from "../config";

function Home() {
  const { isDarkMode } = useDarkMode();

  const features = [
    { title: 'Extensive Collection', icon: BookOpenIcon, description: 'Access thousands of books across various genres and subjects' },
    { title: 'Easy Borrowing', icon: UserGroupIcon, description: 'Seamless book borrowing and return process' },
    { title: 'Digital Access', icon: AcademicCapIcon, description: 'Access digital resources anytime, anywhere' },
    { title: 'Real-time Analytics', icon: ChartBarIcon, description: 'Track your reading progress and history' },
    { title: '24/7 Availability', icon: ClockIcon, description: 'Access the library services round the clock' }
  ];

  const stats = [
    { value: '50,000+', label: 'Books Available' },
    { value: '10,000+', label: 'Active Members' },
    { value: '1,000+', label: 'Digital Resources' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen">
      <PublicNavbar isDarkMode={isDarkMode} />
      
      {/* Adjust the hero section to account for navbar height */}
      <div className={`pt-16 min-h-[80vh] flex items-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-6xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Gateway to <span className="text-blue-600">Knowledge</span> and Discovery
            </h1>
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Access thousands of books, research materials, and digital resources. Join our community of knowledge seekers today.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className={`px-8 py-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} hover:bg-opacity-90 transition-colors text-lg font-semibold`}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stat.value}
                </div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why Choose {APP_NAME}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`p-6 rounded-lg transform hover:scale-105 transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
              >
                <feature.icon className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-4`} />
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Start Your Learning Journey?
          </h2>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of students and researchers who are already part of our community.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Join Now
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
