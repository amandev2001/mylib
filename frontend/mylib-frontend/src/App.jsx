import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import AddBook from './pages/AddBook';
import Members from './pages/Members';
import Loans from './pages/Loans';
import Login from './pages/Login';
import Register from './pages/Register';
import BorrowManagement from './components/BorrowManagement';
import ReservationManagement from './components/admin/ReservationManagement';
import MyReservations from './components/student/MyReservations';
import MyBorrows from './components/MyBorrows';
import FinesAndPayments from './components/student/FinesAndPayments';
import ProtectedRoute from './components/ProtectedRoute';
import { RoleProtectedRoute, ROLES } from './components/RoleProtectedRoute';
import { authService } from './services/authService';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import RoleManagement from './components/RoleManagement';
import Header from './components/Header';
import ManageBooks from './components/admin/ManageBooks';
import FineManagement from './components/admin/FineManagement';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Support from './pages/Support';
import Settings from './pages/Settings';

// Layout wrapper component
const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <Header />
    <div className="pt-16 pl-64">
      <main className="p-6">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize authentication state
    authService.initializeAuth();
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with shared layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Dashboard />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/books" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Books />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/books/:id" element={
              <ProtectedRoute>
                <Layout>
                  <BookDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/books/add" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <AddBook />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Members />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Profile />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/loans" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Loans />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/borrow-management" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <BorrowManagement />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/reservation-management" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <ReservationManagement />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/role-management" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <RoleManagement />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/my-reservations" element={
              <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <MyReservations />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/my-borrows" element={
              <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <MyBorrows />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/manage-books" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LIBRARIAN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <ManageBooks />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/fines" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <FineManagement />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            <Route path="/my-fines" element={
              <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <FinesAndPayments />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            {/* Updated Help and Support routes to use Layout */}
            <Route path="/help" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Help />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/support" element={
              <ProtectedRoute>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Support />
                  </main>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Layout>
                  <main className="container mx-auto px-4 py-8 dark:bg-gray-900">
                    <Settings />
                  </main>
                </Layout>
              </RoleProtectedRoute>
            } />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
