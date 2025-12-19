import api from "./api"; // Tu instancia de axios que apunta a localhost:3000/api

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  // "imagen" debe coincidir con upload.single('imagen') de tu backend
  formData.append("imagen", file); 

  try {
    // IMPORTANTE: La ruta es /files/upload 
    // (porque en server.js pusimos /api/files y en el router pusimos /upload)
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Tu backend devuelve: { success: true, url: "..." }
    return response.data.url; 
    
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    throw error;
  }
};