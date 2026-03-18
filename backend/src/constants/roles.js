export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SENIOR: "SENIOR",
  JUNIOR: "JUNIOR",
};

export const ROLE_LEVELS = {
  [ROLES.OWNER]: 500,
  [ROLES.ADMIN]: 400,
  [ROLES.MANAGER]: 300,
  [ROLES.SENIOR]: 200,
  [ROLES.JUNIOR]: 100,
};

export const isValidRole = (role) => Object.values(ROLES).includes(role);

export const hasRoleAtLeast = (role, minimumRole) => {
  if (!isValidRole(role) || !isValidRole(minimumRole)) {
    return false;
  }
  return ROLE_LEVELS[role] >= ROLE_LEVELS[minimumRole];
};

export const canInviteRole = (inviterRole, targetRole) => {
  if (!isValidRole(inviterRole) || !isValidRole(targetRole)) {
    return false;
  }

  if (targetRole === ROLES.OWNER) {
    return false;
  }

  return ROLE_LEVELS[inviterRole] > ROLE_LEVELS[targetRole];
};
