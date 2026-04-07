import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Music, Book, Film, Gamepad2, Tv, Camera, Check, ArrowRight, Plus } from 'lucide-react';
import { useTranslation } from "react-i18next"; 
import api from "../services/api"; 
import { uploadFileToCloudinary } from '../services/upload'; 
import { useAuth } from '../context/AuthContext'; 

const OnboardingPage = () => {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userId = location.state?.userId || user?.id;
  const username = location.state?.username || user?.username || ''; 
  const googleAvatar = location.state?.googleAvatar || user?.avatar || null; 

  // Definición de categorías 
  const categories = [
    { id: 'Music', label: t("onboarding.categories.Music"), icon: <Music size={32} /> },
    { id: 'Books', label: t("onboarding.categories.Books"), icon: <Book size={32} /> },
    { id: 'Movies', label: t("onboarding.categories.Movies"), icon: <Film size={32} /> },
    { id: 'Games', label: t("onboarding.categories.Games"), icon: <Gamepad2 size={32} /> },
    { id: 'Shows', label: t("onboarding.categories.Shows"), icon: <Tv size={32} /> }
  ];

  const [step, setStep] = useState(1); 
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [imagePreview, setImagePreview] = useState(googleAvatar); 
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false); 

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); 
      setUploadingFile(true);
      try {
        const urlCloudinary = await uploadFileToCloudinary(file);
        setImagePreview(urlCloudinary); 
      } catch (error) {
        alert(t("onboarding.alerts.upload_error"));
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    const storedToken = localStorage.getItem('tribe_token'); 
    
    if (!storedToken) {
        alert(t("onboarding.alerts.session_error"));
        navigate('/login');
        return;
    }

    try {
      await api.put('/users/complete-profile', {
        userId: userId,
        username: username,
        avatarUrl: imagePreview, 
        interests: selectedInterests
      }, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      
      login({ ...user, id: userId, username, avatar: imagePreview }, storedToken);
      navigate('/profile/me'); 

    } catch (error) {
      if (error.response?.status === 401) {
          alert(t("onboarding.alerts.expired"));
          navigate('/login');
      } else {
          alert(t("onboarding.alerts.save_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-base-200 p-10 rounded-3xl shadow-xl">
        
        <ul className="steps w-full mb-8">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>{t("onboarding.steps.photo")}</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>{t("onboarding.steps.interests")}</li>
        </ul>

        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold font-serif">
              {t("onboarding.step1.welcome", { username })}
            </h2>
            <p className="opacity-70">{t("onboarding.step1.subtitle")}</p>
            
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-base-300 shadow-lg relative mx-auto">
                {uploadingFile && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="loading loading-spinner text-white"></span>
                  </div>
                )}
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <Camera size={48} />
                  </div>
                )}
              </div>
              <label className={`absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm shadow-md cursor-pointer ${uploadingFile ? 'btn-disabled' : ''}`}>
                <Plus size={16} />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" disabled={uploadingFile} />
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                className="btn btn-primary flex-1 rounded-full" 
                onClick={() => setStep(2)}
                disabled={uploadingFile} 
              >
                {uploadingFile ? t("onboarding.step1.uploading") : <>{t("onboarding.step1.next")} <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold font-serif">{t("onboarding.step2.title")}</h2>
            
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
              <button className="btn btn-ghost flex-1" onClick={() => setStep(1)}>{t("onboarding.step2.back")}</button>
              <button 
                className="btn btn-primary flex-1 rounded-full" 
                onClick={handleFinish}
                disabled={selectedInterests.length === 0 || loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : t("onboarding.step2.finish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;