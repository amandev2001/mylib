import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { APP_NAME } from "../config";

function Footer() {
  const { isDarkMode } = useDarkMode();
  const links = {
    quickLinks: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/support' },
      { name: 'Help Center', path: '/help' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
    resources: [
      { name: 'Book Catalog', path: '/books' },
      { name: 'E-Resources', path: '/e-resources' },
      { name: 'Research Guides', path: '/research' },
      { name: 'Academic Journals', path: '/journals' },
    ],
    connect : [
      { name: 'Facebook', path: 'https://www.facebook.com/patnauniversityofficial/', target: '_blank' },
      { name: 'Twitter', path: 'https://twitter.com/patnauniversityofficial', target: '_blank' },
      { name: 'Instagram', path: '#', target: '_blank' }, // No official Instagram found
      { name: 'LinkedIn', path: 'https://www.linkedin.com/school/patna-university-/?originalSubdomain=in', target: '_blank' },
    ]
    
  };

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{APP_NAME}</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Empowering knowledge seekers through accessible library resources and innovative digital solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Links</h3>
            <ul className="space-y-2">
              {links.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`hover:text-blue-600 transition-colors ${isDarkMode ? 'hover:text-blue-400' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Resources</h3>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`hover:text-blue-600 transition-colors ${isDarkMode ? 'hover:text-blue-400' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Connect With Us</h3>
            <ul className="space-y-2">
              {links.connect.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} target='link.target' className={`hover:text-blue-600 transition-colors ${isDarkMode ? 'hover:text-blue-400' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
