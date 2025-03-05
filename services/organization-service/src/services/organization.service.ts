import { PrismaClient } from '@prisma/client';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto, UpdateMemberRoleDto, OrgRole } from '../types/organization.types';

const prisma = new PrismaClient();

export class OrganizationService {
  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    const organization = await prisma.organization.create({
      data: {
        ...dto,
        members: {
          create: {
            userId,
            role: OrgRole.OWNER
          }
        }
      },
      include: {
        members: true
      }
    });
    return organization;
  }

  async getOrganization(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    return organization;
  }

  async updateOrganization(id: string, userId: string, dto: UpdateOrganizationDto) {
    // Check if user is owner or admin
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });

    if (!member || (member.role !== OrgRole.OWNER && member.role !== OrgRole.ADMIN)) {
      throw new Error('Unauthorized');
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: dto,
      include: {
        members: true
      }
    });
    return organization;
  }

  async deleteOrganization(id: string, userId: string) {
    // Check if user is owner
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });

    if (!member || member.role !== OrgRole.OWNER) {
      throw new Error('Unauthorized');
    }

    await prisma.organization.delete({
      where: { id }
    });
  }

  async addMember(organizationId: string, requesterId: string, dto: AddMemberDto) {
    // Check if requester is owner or admin
    const requester = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: requesterId,
          organizationId
        }
      }
    });

    if (!requester || (requester.role !== OrgRole.OWNER && requester.role !== OrgRole.ADMIN)) {
      throw new Error('Unauthorized');
    }

    const member = await prisma.organizationMember.create({
      data: {
        userId: dto.userId,
        organizationId,
        role: dto.role || OrgRole.MEMBER
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    return member;
  }

  async updateMemberRole(organizationId: string, memberId: string, requesterId: string, dto: UpdateMemberRoleDto) {
    // Check if requester is owner
    const requester = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: requesterId,
          organizationId
        }
      }
    });

    if (!requester || requester.role !== OrgRole.OWNER) {
      throw new Error('Unauthorized');
    }

    const member = await prisma.organizationMember.update({
      where: {
        id: memberId
      },
      data: {
        role: dto.role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    return member;
  }

  async removeMember(organizationId: string, memberId: string, requesterId: string) {
    // Check if requester is owner or admin
    const requester = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: requesterId,
          organizationId
        }
      }
    });

    if (!requester || (requester.role !== OrgRole.OWNER && requester.role !== OrgRole.ADMIN)) {
      throw new Error('Unauthorized');
    }

    await prisma.organizationMember.delete({
      where: { id: memberId }
    });
  }

  async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true
      }
    });
    return memberships;
  }
}

export const getAll = async () => {
  // Implement your getAll logic here
  return await prisma.organization.findMany();
};

export const getById = async (id: string) => {
  // Implement your getById logic here
  return await prisma.organization.findUnique({
    where: { id }
  });
};

export const create = async (data: any) => {
  // Implement your create logic here
  return await prisma.organization.create({
    data
  });
};

export const update = async (id: string, data: any) => {
  // Implement your update logic here
  return await prisma.organization.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  // Implement your remove logic here
  await prisma.organization.delete({
    where: { id }
  });
  return true;
};