import "./App.css";
// CORRECCIÓN 1: Importa desde 'react-router-dom'
import { Route, Routes } from "react-router-dom"; 

import AuthScreen from "./pages/LoginCard.jsx";
import Landing from "./pages/Landing.jsx";
import Notifications from "./pages/Feed.jsx";
import Explorer from "./pages/Buscador.jsx"; 
import Profile from "./pages/Profiles.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen type="register" />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/feed" element={<Notifications />} />
        {/* Nota: Asegúrate de que Profile maneje la lógica de recibir parámetros si usas :username */}
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;