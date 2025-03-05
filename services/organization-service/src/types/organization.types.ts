export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface AddMemberDto {
  userId: string;
  role?: OrgRole;
}

export interface UpdateMemberRoleDto {
  role: OrgRole;
} 