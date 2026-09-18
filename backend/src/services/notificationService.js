import Notification from '../models/Notification.js';

/**
 * Core function to create and save a notification to MongoDB
 */
export const createNotification = async ({
  recipient,
  actor = null,
  collegeId = null,
  type,
  title,
  message,
  link = '',
  metadata = {},
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      console.warn('[NOTIFICATION] Missing required fields:', { recipient, type, title });
      return null;
    }

    const notification = await Notification.create({
      recipient,
      actor,
      collegeId,
      type,
      title: title.trim(),
      message: message.trim(),
      link: link.trim(),
      metadata,
    });

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION] Failed to save notification to MongoDB:', error.message);
    return null;
  }
};

/**
 * Dedicated helper for experience verification events
 */
export const createVerificationNotification = async ({
  recipient,
  actor = null,
  collegeId = null,
  type, // VERIFICATION_REQUESTED | VERIFICATION_APPROVED | VERIFICATION_REJECTED | VERIFICATION_RESET
  requestedLevel = '',
  studentName = '',
  reviewNote = '',
  verificationId = null,
}) => {
  let title = '';
  let message = '';
  let link = '';

  switch (type) {
    case 'VERIFICATION_REQUESTED':
      title = 'New Verification Request';
      message = `${studentName || 'A student'} has submitted an ${requestedLevel} experience verification request.`;
      link = '/admin/verification';
      console.log('[NOTIFICATION]');
      console.log('Verification request created');
      console.log('Recipient:', recipient?.toString ? recipient.toString() : recipient);
      console.log('Type: VERIFICATION_REQUESTED');
      break;

    case 'VERIFICATION_APPROVED':
      title = 'Experience Verified ✓';
      message = `Your ${requestedLevel} experience verification has been approved by your college.${reviewNote ? ' Note: ' + reviewNote : ''}`;
      link = '/profile';
      console.log('[NOTIFICATION]');
      console.log('Verification approved');
      console.log('Recipient:', recipient?.toString ? recipient.toString() : recipient);
      console.log('Type: VERIFICATION_APPROVED');
      break;

    case 'VERIFICATION_REJECTED':
      title = 'Experience Verification Rejected';
      message = `Your ${requestedLevel} experience verification request was rejected.${reviewNote ? ' Reason: ' + reviewNote : ''}`;
      link = '/profile';
      console.log('[NOTIFICATION]');
      console.log('Verification rejected');
      console.log('Recipient:', recipient?.toString ? recipient.toString() : recipient);
      console.log('Type: VERIFICATION_REJECTED');
      break;

    case 'VERIFICATION_RESET':
      title = 'Verification Reset';
      message = 'Your previous experience verification is no longer valid because you changed your declared experience level.';
      link = '/profile';
      console.log('[NOTIFICATION]');
      console.log('Verification reset');
      console.log('Recipient:', recipient?.toString ? recipient.toString() : recipient);
      console.log('Type: VERIFICATION_RESET');
      break;

    default:
      title = 'Verification Update';
      message = `Your verification status was updated to ${type}.`;
      link = '/profile';
  }

  return await createNotification({
    recipient,
    actor,
    collegeId,
    type,
    title,
    message,
    link,
    metadata: {
      verificationId,
      requestedLevel,
      studentName,
      reviewNote,
    },
  });
};

/**
 * Dedicated helper for team application events
 */
export const createApplicationNotification = async ({
  recipient,
  actor = null,
  collegeId = null,
  type, // APPLICATION_RECEIVED | APPLICATION_ACCEPTED | APPLICATION_REJECTED
  teamTitle = '',
  applicantName = '',
  responseId = null,
  requestId = null,
}) => {
  let title = '';
  let message = '';
  const link = '/my-requests';

  switch (type) {
    case 'APPLICATION_RECEIVED':
      title = 'New Team Application';
      message = `${applicantName || 'A developer'} applied to join your team request "${teamTitle || 'Hackathon Team'}".`;
      break;

    case 'APPLICATION_ACCEPTED':
      title = 'Application Accepted! 🎉';
      message = `Your application to join "${teamTitle || 'the team'}" was accepted!`;
      break;

    case 'APPLICATION_REJECTED':
      title = 'Application Update';
      message = `Your application to join "${teamTitle || 'the team'}" was not accepted.`;
      break;

    default:
      title = 'Application Update';
      message = `Update regarding your application for "${teamTitle}".`;
  }

  return await createNotification({
    recipient,
    actor,
    collegeId,
    type,
    title,
    message,
    link,
    metadata: {
      responseId,
      requestId,
      teamTitle,
      applicantName,
    },
  });
};

/**
 * Dedicated helper for administrative role events
 */
export const createAdminNotification = async ({
  recipient,
  actor = null,
  collegeId = null,
  type, // ADMIN_CREATED | ADMIN_REMOVED | ADMIN_DEACTIVATED
  collegeName = '',
}) => {
  let title = '';
  let message = '';
  let link = '/admin/dashboard';

  switch (type) {
    case 'ADMIN_CREATED':
      title = 'Administrator Access Granted';
      message = `You have been assigned as an administrator for ${collegeName || 'your college institution'}.`;
      link = '/admin/dashboard';
      break;

    case 'ADMIN_REMOVED':
      title = 'Administrator Role Updated';
      message = `Your administrator privileges for ${collegeName || 'your college'} have been revoked.`;
      link = '/dashboard';
      break;

    case 'ADMIN_DEACTIVATED':
      title = 'Admin Account Deactivated';
      message = `Your administrator privileges for ${collegeName || 'your college'} have been temporarily deactivated.`;
      link = '/dashboard';
      break;

    default:
      title = 'Administrative Update';
      message = `Your administrative status has been updated.`;
  }

  return await createNotification({
    recipient,
    actor,
    collegeId,
    type,
    title,
    message,
    link,
    metadata: {
      collegeName,
    },
  });
};

export default {
  createNotification,
  createVerificationNotification,
  createApplicationNotification,
  createAdminNotification,
};
