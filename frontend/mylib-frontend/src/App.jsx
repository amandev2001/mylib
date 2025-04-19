import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import AddBook from "./pages/AddBook";
import Members from "./pages/Members";
import Loans from "./pages/Loans";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BorrowManagement from "./components/BorrowManagement";
import ReservationManagement from "./components/admin/ReservationManagement";
import MyReservations from "./components/student/MyReservations";
import MyBorrows from "./components/MyBorrows";
import FinesAndPayments from "./components/student/FinesAndPayments";
import ProtectedRoute from "./components/ProtectedRoute";
import { RoleProtectedRoute, ROLES } from "./components/RoleProtectedRoute";
import { authService } from "./services/authService";
import { AuthProvider } from "./context/AuthContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import RoleManagement from "./components/RoleManagement";
import Header from "./components/Header";
import ManageBooks from "./components/admin/ManageBooks";
import FineManagement from "./components/admin/FineManagement";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Support from "./pages/Support";
import PasswordReset from "./components/common/PasswordReset";
import Home from "./pages/Home";
import { SidebarProvider } from "./context/SidebarContext";
import { useSidebar } from "./context/SidebarContext";
import About from "./pages/About";
import { UserProvider } from "./context/UserContext";

// Layout wrapper component for protected routes
const ProtectedLayout = ({ children }) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Header />
      <div
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        }`}
      >
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

// Public layout for home page and other public pages
const PublicLayout = ({ children }) => (
  <div className="min-h-screen">{children}</div>
);

function App() {
  useEffect(() => {
    // Initialize authentication state
    authService.initializeAuth();
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <UserProvider>
          <SidebarProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <Home />
                    </PublicLayout>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<PasswordReset />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/about" element={<About />} />


                {/* Protected routes with shared layout */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Dashboard />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Books />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/books/:id"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <BookDetails />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/books/add"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}
                    >
                      <ProtectedLayout>
                        <AddBook />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Members />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Profile />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/loans"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Loans />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/borrow-management"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}
                    >
                      <ProtectedLayout>
                        <BorrowManagement />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/reservation-management"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}
                    >
                      <ProtectedLayout>
                        <ReservationManagement />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/role-management"
                  element={
                    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <ProtectedLayout>
                        <RoleManagement />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/my-reservations"
                  element={
                    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <ProtectedLayout>
                        <MyReservations />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/my-borrows"
                  element={
                    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <ProtectedLayout>
                        <MyBorrows />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/manage-books"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}
                    >
                      <ProtectedLayout>
                        <ManageBooks />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/fines"
                  element={
                    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <ProtectedLayout>
                        <FineManagement />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/my-fines"
                  element={
                    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <ProtectedLayout>
                        <FinesAndPayments />
                      </ProtectedLayout>
                    </RoleProtectedRoute>
                  }
                />

                <Route
                  path="/help"
                  element={
                  
                      <ProtectedLayout>
                        <Help />
                      </ProtectedLayout>
                   
                  }
                />

                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Support />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </SidebarProvider>
        </UserProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
