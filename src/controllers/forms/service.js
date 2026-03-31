import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createServiceRequest, SERVICE_TYPES } from '../../models/forms/service.js';
import { logActivity } from '../../models/log.js';
import { serviceRequestValidation } from '../../middleware/validation/forms.js';

const router = Router();

/**
 * Display the service request form (requires login)
 */
const showServiceRequestForm = (req, res) => {
    res.render('forms/service/form', {
        title: 'Submit Service Request',
        serviceTypes: SERVICE_TYPES
    });
};

/**
 * Handle service request form submission
 */
const handleServiceRequestSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect('/service-request');
    }

    const userId = req.session?.user?.id;
    if (!userId) {
        req.flash('error', 'You must be logged in to submit a service request.');
        return res.redirect('/login');
    }

    const { service_type, vehicle_name, description } = req.body;
    try {
        const created = await createServiceRequest(userId, service_type, vehicle_name, description || null);
        if (created) {
            await logActivity({
                actorUserId: userId,
                action: 'service_request.create',
                targetType: 'service_request',
                targetId: created.id,
                details: `${created.service_type} — ${created.vehicle_name}`
            });
        }
        req.flash('success', 'Your service request has been submitted. We will be in touch soon.');
        return res.redirect('/dashboard');
    } catch (err) {
        console.error('Error saving service request:', err);
        req.flash('error', 'Unable to submit your request. Please try again later.');
        return res.redirect('/service-request');
    }
};

router.get('/', showServiceRequestForm);
router.post('/', serviceRequestValidation, handleServiceRequestSubmission);

export default router;
