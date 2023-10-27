export enum PermissionLevel {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
}

export const permissionLevelHierarchy = {
  [PermissionLevel.NONE]: 0,
  [PermissionLevel.VIEW]: 1,
  [PermissionLevel.EDIT]: 2,
}
