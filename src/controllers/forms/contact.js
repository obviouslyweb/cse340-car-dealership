import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createContactForm } from '../../models/forms/contact.js';

const router = Router();

/**
 * Display the contact form page
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/**
 * Handle contact form submission with validation
 * If validation passes, save to database and redirect
 * If validation fails, log errors and redirect back to form
 */
const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // ERRORS FOUND
        // Store each validation error as a separate flash
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        // Redirect back to form without saving
        return res.redirect('/contact');
    }

    // Success, proceed with database save
    // Extract validated data
    const { subject, message } = req.body;
    try {
        // Save to database
        await createContactForm(subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash('error', 'Unable to submit your message. Please try again later.');
        res.redirect('/contact');
    }
};

/**
 * Display the contact form
 * GET /contact
 */
router.get('/', showContactForm);

/**
 * Handle contact form submission with validation
 * POST /contact
 */
router.post('/', handleContactSubmission);

export default router;