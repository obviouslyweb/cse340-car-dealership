import { Router } from 'express';
import { validationResult } from 'express-validator';
import { moderationUserUpdateValidation } from '../../middleware/validation/forms.js';
import { getAllRoles, getAllUsersWithRoles, updateUserModeration, deleteUser } from '../../models/forms/registration.js';
import { logActivity } from '../../models/log.js';

const router = Router();

/**
 * Admin moderation page for user edits
 * GET /moderation/users
 */
const showModerationUsersPage = async (req, res) => {
    try {
        const [users, roles] = await Promise.all([
            getAllUsersWithRoles(),
            getAllRoles()
        ]);

        res.render('moderation/users', {
            title: 'Review Accounts',
            users: users || [],
            roles: roles || [],
            user: req.session?.user || null
        });
    } catch (err) {
        console.error('Error loading users for moderation:', err);
        req.flash('error', 'Unable to load users. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * Updates a user
 * POST /moderation/users/:id/update
 */
const handleUpdateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect('/moderation/users');
    }

    const targetUserId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetUserId)) {
        return res.redirect('/moderation/users');
    }

    const currentUser = req.session?.user || null;
    const { name, roleName } = req.body;

    try {
        const updatedUser = await updateUserModeration(targetUserId, name, roleName);
        if (!updatedUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/moderation/users');
        }

        // If admin updates their own account, keep the session role
        if (currentUser && currentUser.id === targetUserId) {
            req.session.user.name = updatedUser.name;
            req.session.user.roleName = updatedUser.roleName;
        }

        await logActivity({
            actorUserId: currentUser?.id,
            action: 'user.update',
            targetType: 'user',
            targetId: targetUserId,
            details: `Name: ${updatedUser.name}, role: ${updatedUser.roleName}`
        });

        req.flash('success', 'Account updated successfully.');
        return res.redirect('/moderation/users');
    } catch (err) {
        console.error('Error updating user moderation:', err);
        req.flash('error', 'Unable to update account. Please try again later.');
        return res.redirect('/moderation/users');
    }
};

/**
 * Admin-only deletion of user accounts
 * POST /moderation/users/:id/delete
 */
const handleDeleteUser = async (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetUserId)) {
        return res.redirect('/moderation/users');
    }

    const currentUser = req.session?.user || null;
    if (!currentUser) {
        req.flash('error', 'You must be logged in to delete users.');
        return res.redirect('/login');
    }

    // Prevent admins from deleting their own account
    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/moderation/users');
    }

    try {
        const deleted = await deleteUser(targetUserId);
        if (deleted) {
            await logActivity({
                actorUserId: currentUser.id,
                action: 'user.delete',
                targetType: 'user',
                targetId: targetUserId,
                details: null
            });
            req.flash('success', 'User deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (err) {
        console.error('Error deleting user in moderation:', err);
        req.flash('error', 'Unable to delete user. Please try again later.');
    }

    return res.redirect('/moderation/users');
};

router.get('/', showModerationUsersPage);
router.post('/:id/update', moderationUserUpdateValidation, handleUpdateUser);
router.post('/:id/delete', handleDeleteUser);

export default router;

