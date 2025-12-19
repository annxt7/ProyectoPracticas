import api from './api'; 

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('imagen', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url; 
  } catch (error) {
    console.error("Error en servicio de upload:", error);
    throw error;
  }
};