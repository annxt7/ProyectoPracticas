export const normalizeUser = (u) => {
  if (!u) return null;
  return {
    id: Number(u.user_id || u.id || u.userId),
    username: (u.username || u.name || "usuario"||u.handle).replace(/^@/, '').toLowerCase(),
    avatar: u.avatar_url || u.avatar || u.img || null,
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
    author: (c.username || c.author || "usuario").replace(/^@/, '').toLowerCase()
  };
};