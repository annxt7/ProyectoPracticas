import { lazy, Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import "./App.css";

// Contextos
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; // Asegúrate de tenerlo
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
const AuthScreen = lazy(() => import("./pages/AuthScreen.jsx"));
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Explorer = lazy(() => import("./pages/Buscador.jsx"));
const Profile = lazy(() => import("./pages/Profiles.jsx"));
const Activity = lazy(() => import("./pages/Notifications.jsx"));
const Collection = lazy(() => import("./pages/CollectionPage.jsx"));
const CreateCollection = lazy(() => import("./pages/CreateCollection.jsx"));
const OnboardingPage = lazy(() => import("./pages/OnBoarding.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const ResetPasswordScreen = lazy(() => import("./pages/ResetPassword.jsx"));


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense 
          fallback={
            <div className="h-screen w-full flex items-center justify-center bg-base-100">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          }
        >
          <Routes>
            {/* --- RUTAS PÚBLICAS  --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/register" element={<AuthScreen type="register" />} />
            <Route path="/forgot-password" element={<AuthScreen type="forgot" />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />

            {/* --- RUTAS PRIVADAS  --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/explorer" element={<Explorer />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/collection/:id" element={<Collection />} />
                <Route path="/create-collection" element={<CreateCollection />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;