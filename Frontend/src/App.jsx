import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

// Contexto
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Componentes Globales (IMPORTANTE: Carga normal, no lazy, para que el context no falle)
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import NavDesktop from "./components/NavDesktop.jsx"; // Asegúrate de que la ruta sea correcta

// Páginas (Lazy Loading)
const AuthScreen = lazy(() => import("./pages/LoginCard.jsx"));
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
    <ThemeProvider>
      {/* 1. El NavDesktop DEBE estar dentro del Provider */}
      {/* Solo se muestra si no estamos en la Landing o Login (opcional) */}
      <NavDesktop /> 

      <Suspense 
        fallback={
          <div className="h-screen w-full flex items-center justify-center bg-base-200">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthScreen />} />
          {/* ... resto de rutas */}
          <Route element={<ProtectedRoute />}>
             <Route path="/feed" element={<Feed />} />
             {/* etc... */}
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;