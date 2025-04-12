import {
    BookOpenIcon,
    UserGroupIcon,
    LightBulbIcon,
    ArrowRightIcon,
    BuildingLibraryIcon,
    AcademicCapIcon,
  } from "@heroicons/react/24/outline";
  import { Link } from "react-router-dom";
  import { useDarkMode } from "../context/DarkModeContext";
  import Footer from "../components/Footer";
  import PublicNavbar from "../components/PublicNavbar";
  import { APP_NAME } from "../config";
  import usePageTitle from "../utils/useTitle";
  
  function About() {
    const { isDarkMode } = useDarkMode();
  
    usePageTitle("About Us", APP_NAME);
  
    const missionValues = [
      {
        title: "Knowledge for All",
        icon: BookOpenIcon,
        description:
          "We believe in making educational resources accessible to everyone",
      },
      {
        title: "Community Focused",
        icon: UserGroupIcon,
        description: "Building a vibrant community of readers and learners",
      },
      {
        title: "Innovation",
        icon: LightBulbIcon,
        description: "Constantly evolving our services to meet modern needs",
      },
    ];
  
    const teamMembers = [
      {
        name: "Dr. Sarah Johnson",
        position: "Library Director",
        bio: "Ph.D in Library Sciences with over 15 years of experience in digital library management",
        image: "/images/default.png"
      },
      {
        name: "Michael Chen",
        position: "Head of Digital Resources",
        bio: "Former tech executive passionate about making digital resources accessible to all",
        image: "/images/default.png"
      },
      {
        name: "Priya Patel",
        position: "Community Outreach Manager",
        bio: "Specializes in creating educational programs that connect communities with resources",
        image: "/images/default.png"
      },
    ];
  
    const historyTimeline = [
      {
        year: "2005",
        title: "Foundation",
        description: "Established as a small community library with 5,000 books"
      },
      {
        year: "2010",
        title: "Digital Expansion",
        description: "Launched our first digital catalog and online borrowing system"
      },
      {
        year: "2015",
        title: "Research Center",
        description: "Opened specialized research sections and academic partnerships"
      },
      {
        year: "2020",
        title: "Modern Transformation",
        description: "Complete digital transformation with 24/7 online services"
      },
    ];
  
    return (
      <div className="min-h-screen">
        <PublicNavbar isDarkMode={isDarkMode} />
  
        {/* Hero section */}
        <div
          className={`pt-16 py-20 ${
            isDarkMode
              ? "bg-gray-900"
              : "bg-gradient-to-r from-blue-50 to-indigo-50"
          }`}
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="text-center lg:text-left lg:w-2/3">
                <h1
                  className={`text-4xl lg:text-5xl font-bold mb-6 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  About <span className="text-blue-600">{APP_NAME}</span>
                </h1>
                <p
                  className={`text-xl mb-8 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Empowering minds through accessible knowledge since 2005. Our mission is to create a space where learning is boundless and resources are accessible to all.
                </p>
              </div>
              <div className="lg:w-1/3 mt-8 lg:mt-0 flex justify-center">
                <img  src="/images/About us page-cuate (1).svg" alt="about us image" />
              </div>
            </div>
          </div>
        </div>
  
        {/* Our Mission Section */}
        <div className={`py-16 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="container mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Our Mission & Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {missionValues.map((item) => (
                <div
                  key={item.title}
                  className={`p-6 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-700"
                      : "bg-blue-50"
                  }`}
                >
                  <item.icon
                    className={`w-12 h-12 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    } mb-4`}
                  />
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* History Timeline */}
        <div className={`py-16 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="container mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Our Journey
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div 
                className={`absolute left-1/2 transform -translate-x-1/2 h-full w-1 ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-200"
                }`}
              ></div>
              
              {/* Timeline items */}
              <div className="space-y-12">
                {historyTimeline.map((item, index) => (
                  <div key={item.year} className="relative">
                    {/* Timeline dot */}
                    <div 
                      className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${
                        isDarkMode ? "bg-blue-500" : "bg-blue-600"
                      }`}
                    ></div>
                    
                    {/* Content - alternating left and right */}
                    <div 
                      className={`flex ${
                        index % 2 === 0 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div 
                        className={`w-5/12 p-6 rounded-lg ${
                          isDarkMode ? "bg-gray-800" : "bg-white shadow"
                        }`}
                      >
                        <span 
                          className={`inline-block px-3 py-1 rounded-full mb-3 text-sm font-semibold ${
                            isDarkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.year}
                        </span>
                        <h3 
                          className={`text-xl font-semibold mb-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p 
                          className={`${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        {/* Team Section */}
        <div className={`py-16 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="container mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member?.name}
                  className={`p-6 rounded-lg text-center ${
                    isDarkMode
                      ? "bg-gray-700"
                      : "bg-white shadow"
                  }`}
                >
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                    <img
                      src={member?.image}
                      alt={member?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/150/150";
                        e.target.alt = "Profile placeholder";
                      }}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {member?.name}
                  </h3>
                  <p
                    className={`text-sm mb-3 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {member?.position}
                  </p>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {member?.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* CTA Section */}
        <div className={`py-16 ${isDarkMode ? "bg-gray-900" : "bg-blue-50"}`}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center">
              {/* CTA Text */}
              <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
                <h2
                  className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Join Our Community
                </h2>
                <p
                  className={`mb-8 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Become a member today and unlock access to our extensive collection of resources, events, and educational programs.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Become a Member
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
  
              {/* SVG Illustration */}
              <div className="lg:w-1/2 flex justify-center">
                <AcademicCapIcon
                  className={`w-64 h-64 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
  
        {/* FAQ Accordion - Optional */}
        <div className={`py-16 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="container mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto">
              {/* FAQ Item 1 */}
              <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  What resources does {APP_NAME} offer?
                </h3>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  We offer a comprehensive collection of physical books, e-books, academic journals, research papers, multimedia resources, and specialized databases across various subjects and disciplines.
                </p>
              </div>
              
              {/* FAQ Item 2 */}
              <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  How can I become a member?
                </h3>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  You can become a member by registering online through our website or visiting our physical location with valid identification. Membership options include standard, premium, and academic plans with different benefits.
                </p>
              </div>
              
              {/* FAQ Item 3 */}
              <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Are there any special programs for students and researchers?
                </h3>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Yes, we offer specialized academic programs, research assistance, study spaces, and access to premium databases for students and researchers. We also host regular workshops and seminars on various academic topics.
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <Footer />
      </div>
    );
  }
  
  export default About;