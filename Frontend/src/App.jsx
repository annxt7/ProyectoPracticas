import "./App.css";
import { Route, Routes } from "react-router-dom";

import AuthScreen from "./pages/LoginCard.jsx";
import Landing from "./pages/Landing.jsx";
import Feed from "./pages/Feed.jsx";
import Explorer from "./pages/Buscador.jsx";
import Profile from "./pages/Profiles.jsx";
import Activity from "./pages/Notifications.jsx";
import Collection from "./pages/CollectionPage.jsx";
import CreateCollection from "./pages/CreateCollection.jsx";
import OnboardingPage from "./pages/OnBoarding.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <>
      <Routes>
        //Rutas Publicas
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen type="register" />} />
        <Route path="/forgot-password" element={<AuthScreen type="forgot" />} />
        //Rutas Privadas
        <Route element={<ProtectedRoute />}>
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/collection/:id" element={<Collection />} />
          <Route path="/create-collection" element={<CreateCollection />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
