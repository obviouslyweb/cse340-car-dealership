import { Router } from 'express';
import { getAllContactForms, deleteContactForm } from '../../models/forms/contact.js';
import { logActivity } from '../../models/log.js';

const router = Router();

/**
 * GET /moderation/contact
 * List all contact form submissions (employees/admins)
 */
const showContactSubmissionsPage = async (req, res) => {
    try {
        const contactForms = await getAllContactForms();
        res.render('moderation/contact', {
            title: 'Contact Form Submissions',
            contactForms: contactForms || []
        });
    } catch (err) {
        console.error('Error loading contact submissions:', err);
        req.flash('error', 'Unable to load contact submissions. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * POST /moderation/contact/:id/delete
 * Delete a contact form submission
 */
const handleDelete = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }
    try {
        const row = await deleteContactForm(id);
        if (row) {
            await logActivity({
                actorUserId: req.session?.user?.id,
                action: 'contact.delete',
                targetType: 'contact',
                targetId: id,
                details: null
            });
            req.flash('success', 'Contact submission deleted.');
        } else {
            req.flash('error', 'Submission not found or already deleted.');
        }
    } catch (err) {
        console.error('Error deleting contact submission:', err);
        req.flash('error', 'Unable to delete submission. Please try again later.');
    }
    res.redirect('/moderation/contact');
};

router.get('/', showContactSubmissionsPage);
router.post('/:id/delete', handleDelete);

export default router;
