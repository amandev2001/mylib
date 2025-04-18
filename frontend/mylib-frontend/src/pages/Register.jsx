import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useDarkMode } from "../context/DarkModeContext";
import Footer from "../components/Footer";
import PublicNavbar from "../components/PublicNavbar";
import { APP_NAME } from "../config";
import { memberService } from "../services/memberService";

function Register() {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleList: ["ROLE_STUDENT"], // Default role
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors for this field when user starts typing again
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    // if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    // if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/; // Basic international format
    if (!phoneNumber.trim()) return "Phone number is required";
    if (!phoneRegex.test(phoneNumber)) return "Please enter a valid phone number";
    return "";
  };

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name is too short";
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setRegistrationSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await memberService.createMember(formData);
      setRegistrationSuccess(true);
      
      // Reset the form
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        roleList: ["ROLE_STUDENT"]
      });
      
      // Show success message for longer (15 seconds) to give user time to read
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Please check your email to verify your account before logging in." 
          }
        });
      }, 15000);
      
    } catch (err) {
      if (err.response?.status === 409) {
        setGeneralError("An account with this email already exists.");
      } else {
        setGeneralError(err.response?.data?.message || "Failed to register. Please try again.");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (id, label, type, placeholder, value, onChange) => (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={type === "password" ? "new-password" : type === "email" ? "username" : ""}
        required
        className={`mt-1 block w-full px-3 py-2 border ${
          errors[id] 
            ? "border-red-500 ring-1 ring-red-500" 
            : isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "border-gray-300 placeholder-gray-400"
        } rounded-md shadow-sm
        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
        ${errors[id] ? (isDarkMode ? "bg-red-900/30" : "bg-red-50") : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-red-500">{errors[id]}</p>
      )}
    </div>
  );

  const SuccessMessage = () => (
    <div className={`mb-6 p-4 rounded-md ${isDarkMode ? "bg-green-900" : "bg-green-50"} border-l-4 border-green-500`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-green-400" 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${isDarkMode ? "text-green-200" : "text-green-800"}`}>
            Registration Successful!
          </h3>
          <div className={`mt-2 text-sm ${isDarkMode ? "text-green-200" : "text-green-700"}`}>
            <p>A verification link has been sent to <strong>{formData.email || "your email address"}</strong>.</p>
            <p className="mt-1">Please check your inbox and verify your email to complete registration.</p>
            <p className="mt-2">Redirecting to login page in a few seconds...</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PublicNavbar isDarkMode={isDarkMode} />
      <div
        className={`pt-16 min-h-screen flex items-center justify-center ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-900 to-gray-800"
            : "bg-gradient-to-r from-blue-100 to-blue-50"
        } py-12 px-4 sm:px-6 lg:px-8`}
      >
        <div
          className={`max-w-md w-full ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-2xl p-8 space-y-8`}
        >
          <div className="text-center">
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              {APP_NAME}
            </h1>
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Create Account
            </h2>
            <p
              className={`mt-2 text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join our library community
            </p>
          </div>

          {registrationSuccess ? (
            <SuccessMessage />
          ) : (
            <form
              className="mt-8 space-y-6"
              autoComplete="on"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                {renderInputField(
                  "name",
                  "Full Name",
                  "text",
                  "Enter your full name",
                  formData.name,
                  handleChange
                )}

                {renderInputField(
                  "email",
                  "Email address",
                  "email",
                  "Enter your email",
                  formData.email,
                  handleChange
                )}

                {renderInputField(
                  "password",
                  "Password",
                  "password",
                  "Create a password",
                  formData.password,
                  handleChange
                )}
                {!errors.password && formData.password && (
                  <div className="text-xs text-green-500 mt-1">
                    Password meets all requirements
                  </div>
                )}

                {renderInputField(
                  "phoneNumber",
                  "Phone Number",
                  "tel",
                  "Enter your phone number",
                  formData.phoneNumber,
                  handleChange
                )}
              </div>

              {generalError && (
                <div
                  className={`${
                    isDarkMode
                      ? "bg-red-900 border-red-700"
                      : "bg-red-50 border-red-400"
                  } border-l-4 p-4`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-red-200" : "text-red-700"
                        }`}
                      >
                        {generalError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                           bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                           disabled:bg-blue-300 disabled:cursor-not-allowed transform transition duration-100 hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>

              <div className="text-center text-sm">
                <span
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className={`font-medium ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  } hover:underline`}
                >
                  Sign in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;