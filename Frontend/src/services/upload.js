import api from "./api";
import imageCompression from 'browser-image-compression';

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  try {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,

    };
  
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    const formData = new FormData();
  
    formData.append("imagen", compressedFile); 

    const response = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.url; 
  } catch (error) {
    console.error("Error en uploadFileToCloudinary:", error);
    throw error;
  }
};