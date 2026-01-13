import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

// Recibe la prop de manejo de éxito del padre (AuthScreen)
const GoogleSignIn = ({ onGoogleSuccess, isLoading }) => { 
  
  const onSuccess = (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (onGoogleSuccess) {
      onGoogleSuccess(idToken); // Llama a la función del componente grande
    }
  };

  const onError = () => {
    console.log('Fallo en el inicio de sesión con Google (cliente)');
  };

  return (
    <div style={isLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text= "continue_with" 
        shape= "square"
        theme= "filled_blue"
        background= "none"
      />
    </div>
  );
};

export default GoogleSignIn;