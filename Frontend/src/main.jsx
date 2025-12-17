import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx'; // Asegúrate de que el nombre del archivo sea correcto (App.jsx o App.js)

const GOOGLE_CLIENT_ID = "1091416184964-ajmmqbvuiafcl6k4t1q61pn430u412mt.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
      <BrowserRouter> 
        <App /> 
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);