import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx'; 
import { AuthProvider } from './context/AuthContext.jsx';
import './i18n.js'

const GOOGLE_CLIENT_ID = "866935818800-gk66q1lpnvkp1iqg298nmj08opg6q3ak.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
      <AuthProvider>
      <BrowserRouter> 
        <App /> 
      </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);