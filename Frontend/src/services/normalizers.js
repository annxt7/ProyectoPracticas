export const normalizeUser = (u) => {
  if (!u) return null;
  return {
    // Buscamos todas las variantes para asegurar que 'id' nunca sea undefined
    id: Number(u.user_id || u.id || u.userId),
    // Limpiamos el username de arrobas duplicadas y aseguramos que exista
    username: (u.username || u.name || "usuario").replace(/^@/, '').toLowerCase(),
    // Sincronizado con tu columna 'avatar_url'
    avatar: u.avatar_url || u.avatar || null,
    banner: u.banner_url || u.banner || null,
    bio: u.bio || "",
    email: u.email || "",
    role: u.role || "user"
  };
};

export const normalizeCollection = (c) => {
  if (!c) return null;
  return {
    id: Number(c.collection_id || c.id),
    creatorId: Number(c.user_id || c.creator_id),
    title: c.collection_name || c.title || "Sin título",
    cover: c.cover_url || c.cover,
    // El autor suele venir del JOIN con la tabla Users
    author: (c.username || c.author || "usuario").replace(/^@/, '').toLowerCase()
  };
};