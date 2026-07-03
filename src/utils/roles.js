export const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = String(role).trim().toLowerCase();

  if (normalized === 'admin' || normalized === 'role_admin') return 'admin';
  if (normalized === 'user' || normalized === 'customer' || normalized === 'role_user') return 'user';

  return null;
};

export const getRoles = (role) => {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case 'user':
      return '/dashboard/user';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/login';
  }
};
