import api from "./api";
import imageCompression from 'browser-image-compression'; // <--- IMPORTANTE

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  try {
   
    const options = {
      maxSizeMB: 0.8,          
      maxWidthOrHeight: 1200, 
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    // 3. ENVIAMOS EL ARCHIVO COMPRIMIDO
    const formData = new FormData();
    formData.append("imagen", compressedFile); // <--- Enviamos el comprimido

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url; 
    
  } catch (error) {
    console.error("Error en el proceso (compresión o subida):", error);
    throw error;
  }
};