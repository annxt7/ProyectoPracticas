import api from "./api";
import imageCompression from 'browser-image-compression';

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  try {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      // Mantenemos el tipo original
    };
    
    // 1. Comprimimos (devuelve un Blob)
    const compressedBlob = await imageCompression(file, options);

    // 2. CONVERSIÓN CRÍTICA: De Blob a File
    // Esto asegura que el servidor reciba un archivo con nombre, tipo y fecha.
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    const formData = new FormData();
    // 3. Enviamos el File real
    formData.append("imagen", compressedFile); 

    const response = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Importante: Verifica que tu backend devuelva exactamente la propiedad 'url'
    return response.data.url; 
  } catch (error) {
    console.error("Error en uploadFileToCloudinary:", error);
    throw error;
  }
};