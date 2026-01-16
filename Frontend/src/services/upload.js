import api from "./api";
import imageCompression from 'browser-image-compression';

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  try {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: file.type 
    };
    
    // Comprimimos el archivo
    const compressedBlob = await imageCompression(file, options);

    const formData = new FormData();
  
    formData.append("imagen", compressedBlob, file.name); 

    const response = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.url; 
  } catch (error) {
    console.error("Error en uploadFileToCloudinary:", error);
    throw error;
  }
};