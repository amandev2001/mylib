import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import { useDarkMode } from "../../context/DarkModeContext";
import { APP_NAME } from "../../config";
import Footer from "../../components/Footer";
import PublicNavbar from "../../components/PublicNavbar";

function ResetPassword() {
  const appName = APP_NAME;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");
    
    if (userId && token) {
      setIsResetMode(true);
      // Validate the reset token
      authService.validateResetToken(userId, token)
        .catch(err => {
          setError("This password reset link is invalid or has expired. Please request a new one.");
          setIsResetMode(false);
        });
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isResetMode) {
        // Handle password reset with token
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");

        if (!formData.newPassword || !formData.confirmPassword) {
          throw new Error("Please enter and confirm your new password");
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (formData.newPassword.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        await authService.resetPasswordWithToken(userId, token, formData.newPassword);
        setSuccessMessage("Password has been reset successfully. You can now login with your new password.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // Handle forgot password request
        if (!formData.email) {
          throw new Error("Please enter your email address");
        }

        await authService.forgotPassword(formData.email);
        setSuccessMessage("If your email is registered, you will receive password reset instructions shortly.");
      }

      setError("");
      setFormData({ email: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setSuccessMessage("");
      const errorMessage = err.response?.data?.message || err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PublicNavbar isDarkMode={isDarkMode} />
      <div className={`pt-16 min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gradient-to-r from-gray-900 to-gray-800" : "bg-gradient-to-r from-blue-100 to-blue-50"
      } py-12 px-4 sm:px-6 lg:px-8`}>
        <div className={`max-w-md w-full ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl p-8 space-y-8`}>
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2`}>
              {appName}
            </h1>
            <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {isResetMode ? "Reset Your Password" : "Forgot Password"}
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {isResetMode 
                ? "Enter your new password below" 
                : "Enter your email and we'll send you instructions to reset your password"}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="on">
            <div className="space-y-4">
              {!isResetMode ? (
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300 placeholder-gray-400"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="newPassword" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300 placeholder-gray-400"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300 placeholder-gray-400"
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={8}
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className={`p-4 rounded-md ${isDarkMode ? "bg-red-900 text-red-100" : "bg-red-50 text-red-700"}`}>
                {error}
              </div>
            )}

            {successMessage && (
              <div className={`p-4 rounded-md ${isDarkMode ? "bg-green-900 text-green-100" : "bg-green-50 text-green-700"}`}>
                {successMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isResetMode ? "Resetting Password..." : "Sending Instructions..."}
                  </div>
                ) : (
                  isResetMode ? "Reset Password" : "Send Reset Instructions"
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Remember your password?{" "}
              </span>
              <Link
                to="/login"
                className={`font-medium ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} hover:underline`}
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;