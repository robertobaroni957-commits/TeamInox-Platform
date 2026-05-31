export type Role = 'admin' | 'moderator' | 'captain' | 'athlete' | 'user' | 'guest';

export type Permission = 
  | 'zrl.view' 
  | 'zrl.manage' 
  | 'zrl.lineup' 
  | 'zrl.results' 
  | 'wt.view' 
  | 'wt.register' 
  | 'wt.manage'
  | 'teams.view' 
  | 'teams.manage' 
  | 'questionnaire.view' 
  | 'questionnaire.edit' 
  | 'admin.system'
  | 'events.view'
  | 'events.manage'
  | 'analytics.view'
  | 'racing.view';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'zrl.view', 'zrl.manage', 'zrl.lineup', 'zrl.results',
    'wt.view', 'wt.register', 'wt.manage',
    'teams.view', 'teams.manage',
    'questionnaire.view', 'questionnaire.edit',
    'admin.system',
    'events.view', 'events.manage',
    'analytics.view',
    'racing.view'
  ],
  moderator: [
    'zrl.view', 'zrl.manage', 'zrl.lineup', 'zrl.results',
    'wt.view', 'wt.register', 'wt.manage',
    'teams.view', 'teams.manage',
    'questionnaire.view', 'questionnaire.edit',
    'events.view', 'events.manage',
    'analytics.view',
    'racing.view'
  ],
  captain: [
    'zrl.view', 'zrl.lineup', 'zrl.results',
    'wt.view', 'wt.register',
    'teams.view',
    'questionnaire.view', 'questionnaire.edit',
    'events.view',
    'analytics.view',
    'racing.view'
  ],
  athlete: [
    'zrl.view', 'zrl.results',
    'wt.view', 'wt.register',
    'teams.view',
    'questionnaire.view', 'questionnaire.edit',
    'events.view',
    'analytics.view',
    'racing.view'
  ],
  user: [ // athlete and user are often used interchangeably in legacy code
    'zrl.view', 'zrl.results',
    'wt.view', 'wt.register',
    'teams.view',
    'questionnaire.view', 'questionnaire.edit',
    'events.view',
    'analytics.view',
    'racing.view'
  ],
  guest: [
    'zrl.view', 'zrl.results',
    'wt.view',
    'events.view',
    'racing.view'
  ]
};

export const hasPermission = (role: string | undefined, permission: Permission, isZRLParticipant: boolean = false): boolean => {
  if (!role) return false;
  
  // Rule: ZRL functions require participant status
  if (permission.startsWith('zrl.') && !isZRLParticipant && role !== 'admin') {
    return false;
  }
  
  const userRole = role as Role;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const getPermissionsByRole = (role: string | undefined): Permission[] => {
  if (!role) return [];
  return ROLE_PERMISSIONS[role as Role] || [];
};
