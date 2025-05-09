import api from './api';

export interface Invitation {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
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
 * Generate a new invitation code with 5-minute expiration
 */
export const createInvitation = async (): Promise<Invitation> => {
  try {
    // Set expiration to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    const response = await api.post('/invitations', {
      expiresAt: expiresAt.toISOString()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

/**
 * Get all invitations created by the current user
 * Active invitations are those that are not used and not expired
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
 * Check if an invitation is expired
 */
export const isInvitationExpired = (invitation: Invitation): boolean => {
  if (!invitation.expiresAt) return false;
  const expiryDate = new Date(invitation.expiresAt);
  const now = new Date();
  return now > expiryDate;
};

/**
 * Delete an invitation from the database
 */
export const deleteInvitation = async (invitationId: string): Promise<void> => {
  try {
    await api.delete(`/invitations/${invitationId}`);
  } catch (error) {
    console.error('Error deleting invitation:', error);
    // We don't throw the error here to prevent UI disruption
    // Just log it and continue
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
    // Return empty array instead of throwing error to avoid breaking the UI
    return [];
  }
};

/**
 * Validate an invitation code
 * This checks if the code exists, is not used, and has not expired
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