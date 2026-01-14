export const normalizeUser = (u) => ({
  id: u.id || u.userId,
  username: u.username,
  avatar: u.avatar || u.avatarUrl || null,
  banner: u.banner || u.bannerUrl || null,
  bio: u.bio || "",
  email: u.email,
  role: u.role ,
});
