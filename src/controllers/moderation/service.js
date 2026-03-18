import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
    getAllServiceRequestsForModeration,
    updateServiceRequestByStaff,
    deleteServiceRequest
} from '../../models/forms/service.js';
import { serviceRequestModerationValidation } from '../../middleware/validation/forms.js';

const router = Router();

/**
 * GET /moderation/service
 * List all service requests for employees/admins
 */
const showModerationPage = async (req, res) => {
    try {
        const serviceRequests = await getAllServiceRequestsForModeration();
        res.render('moderation/service', {
            title: 'Service Requests',
            serviceRequests: serviceRequests || []
        });
    } catch (err) {
        console.error('Error loading service requests for moderation:', err);
        req.flash('error', 'Unable to load service requests. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * POST /moderation/service/:id
 * Update status, employee_notes, status_facing_user
 */
const handleUpdate = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect('/moderation/service');
    }
    try {
        const { status, employee_notes, status_facing_user } = req.body;
        const row = await updateServiceRequestByStaff(id, status, employee_notes, status_facing_user);
        if (row) {
            req.flash('success', 'Service request updated.');
        } else {
            req.flash('error', 'Service request not found.');
        }
    } catch (err) {
        console.error('Error updating service request:', err);
        req.flash('error', 'Unable to update service request. Please try again later.');
    }
    return res.redirect('/moderation/service');
};

/**
 * POST /moderation/service/:id/delete
 * Delete service request
 */
const handleDelete = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }
    try {
        const row = await deleteServiceRequest(id);
        if (row) {
            req.flash('success', 'Service request deleted.');
        } else {
            req.flash('error', 'Service request not found or already deleted.');
        }
    } catch (err) {
        console.error('Error deleting service request:', err);
        req.flash('error', 'Unable to delete service request. Please try again later.');
    }
    return res.redirect('/moderation/service');
};

router.get('/', showModerationPage);
router.post('/:id', serviceRequestModerationValidation, handleUpdate);
router.post('/:id/delete', handleDelete);

export default router;
