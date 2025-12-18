import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Music, Book, Film, Gamepad2, Tv, Camera, Check, ArrowRight, Plus } from 'lucide-react';
import api from "../services/api"; // Tu instancia de axios

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
  
  // 1. Recuperamos el userId que enviamos desde el Registro
  const userId = location.state?.userId;

  // 2. Estados para controlar la página
  const [step, setStep] = useState(1); // Paso 1: Foto, Paso 2: Gustos
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para seleccionar/deseleccionar gustos
  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(item => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Función para simular la subida de foto (por ahora solo visual)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- EL MOMENTO FINAL: Enviar al Backend ---
  const handleFinish = async () => {
    setLoading(true);
    try {
      // Llamamos a la función del servidor que crearemos luego
      await api.put('/users/complete-profile', {
        userId: userId,
        avatarUrl: imagePreview || null, // Aquí mandaríamos la ruta real más adelante
        interests: selectedInterests
      });

      // Si todo va bien, ¡a su perfil!
      navigate('/profile/me');
    } catch (error) {
      console.error("Error al completar perfil", error);
      alert("Hubo un error al guardar tus gustos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-base-200 p-10 rounded-3xl shadow-xl">
        
        {/* INDICADOR DE PASOS (DaisyUI) */}
        <ul className="steps w-full mb-8">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Tu Foto</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Tus Gustos</li>
        </ul>

        {/* --- PASO 1: LA FOTO --- */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold font-serif">¡Hola! Pongamos cara a tu cuenta</h2>
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-base-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <Camera size={48} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm">
                <Plus size={16} />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            <p className="opacity-60">Sube una foto para que tus amigos te reconozcan.</p>
            <button className="btn btn-primary w-full rounded-full" onClick={() => setStep(2)}>
              Siguiente <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* --- PASO 2: LOS GUSTOS --- */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold font-serif">¿Qué te apasiona?</h2>
            <p className="opacity-60">Crearemos colecciones automáticas basadas en lo que elijas.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    selectedInterests.includes(cat.id) 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-base-300 opacity-60'
                  }`}
                >
                  {cat.icon}
                  <span className="font-bold text-sm">{cat.label}</span>
                  {selectedInterests.includes(cat.id) && <Check size={16} className="absolute top-2 right-2" />}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button className="btn btn-ghost flex-1" onClick={() => setStep(1)}>Atrás</button>
              <button 
                className="btn btn-primary flex-1 rounded-full" 
                onClick={handleFinish}
                disabled={selectedInterests.length === 0 || loading}
              >
                {loading ? 'Preparando tu Tribe...' : '¡Empezar!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;