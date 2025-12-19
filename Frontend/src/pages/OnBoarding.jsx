import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Music, Book, Film, Gamepad2, Tv, Camera, Check, ArrowRight, Plus } from 'lucide-react';
import api from "../services/api";

const categories = [
  { id: 'Music', label: 'Música', icon: <Music size={32} /> },
  { id: 'Books', label: 'Libros', icon: <Book size={32} /> },
  { id: 'Movies', label: 'Cine', icon: <Film size={32} /> },
  { id: 'Games', label: 'Juegos', icon: <Gamepad2 size={32} /> },
  { id: 'Shows', label: 'Series', icon: <Tv size={32} /> }
];

const OnboardingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraemos datos del estado de navegación
  const userId = location.state?.userId;
  const username = location.state?.username || ''; 
  const googleAvatar = location.state?.avatarUrl || null;

  // CAMBIO DE PLANES: Empezamos directamente en el paso 1 (Foto)
  // El username de Google es el definitivo.
  const [step, setStep] = useState(1); 
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [imagePreview, setImagePreview] = useState(googleAvatar); // Usamos la de Google por defecto
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Datos recibidos de Google/Registro:", { userId, username });
    if (!userId) {
      console.warn("No se recibió userId. Redirigiendo al login...");
      navigate('/login');
    }
  }, [userId, username, navigate]);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(item => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      // Nota: Aquí podrías implementar la lógica de subida a un servidor
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Enviamos la actualización final del perfil
      await api.put('/users/complete-profile', {
        userId: userId,
        username: username, // Enviamos el username que nos dio Google
        avatarUrl: imagePreview,
        interests: selectedInterests
      });
      
      navigate('/profile/me');
    } catch (error) {
      console.error("Error al completar perfil:", error);
      alert("No pudimos guardar tus preferencias. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-base-200 p-10 rounded-3xl shadow-xl">
        
        {/* Barra de Progreso Simplificada */}
        <ul className="steps w-full mb-8">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Tu Foto</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Tus Gustos</li>
        </ul>

        {/* PASO 1: FOTO DE PERFIL */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold font-serif">¡Bienvenido, {username}!</h2>
            <p className="opacity-70">Hemos tomado tu nombre de Google. ¿Quieres cambiar tu foto?</p>
            
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-base-300 shadow-lg">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <Camera size={48} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm shadow-md">
                <Plus size={16} />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button className="btn btn-primary flex-1 rounded-full" onClick={() => setStep(2)}>
                Siguiente <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: INTERESES */}
        {step === 2 && (
          <div className="text-center space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold font-serif">¿Qué te apasiona?</h2>
            <p className="text-sm opacity-70">Personalizaremos tu experiencia según tus gustos.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative ${
                    selectedInterests.includes(cat.id) 
                    ? 'border-primary bg-primary/10 text-primary scale-105 shadow-sm' 
                    : 'border-base-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  {cat.icon}
                  <span className="font-bold text-sm">{cat.label}</span>
                  {selectedInterests.includes(cat.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                        <Check size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button className="btn btn-ghost flex-1" onClick={() => setStep(1)}>Atrás</button>
              <button 
                className="btn btn-primary flex-1 rounded-full" 
                onClick={handleFinish}
                disabled={selectedInterests.length === 0 || loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : '¡Empezar!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;