import api from './api';

export interface Invitation {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  invitee: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  } | null;
  usedAt: string | null;
}

export interface InvitedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  invitationUsedAt: string;
}

/**
 * Generate a new invitation code
 */
export const createInvitation = async (): Promise<Invitation> => {
  try {
    const response = await api.post('/invitations');
    return response.data.data;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

/**
 * Get all invitations created by the current user
 */
export const getMyInvitations = async (): Promise<Invitation[]> => {
  try {
    const response = await api.get('/invitations');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

/**
 * Get all users who used the current user's invitation codes
 */
export const getInvitedUsers = async (): Promise<InvitedUser[]> => {
  try {
    const response = await api.get('/invitations/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invited users:', error);
    throw error;
  }
};

/**
 * Validate an invitation code
 */
export const validateInvitation = async (code: string): Promise<{code: string, inviter: {id: string, name: string}}> => {
  try {
    const response = await api.get(`/invitations/validate/${code}`);
    return response.data.data;
  } catch (error) {
    console.error('Error validating invitation:', error);
    throw error;
  }
}; 