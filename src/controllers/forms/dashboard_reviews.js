import { validationResult } from 'express-validator';
import { getReviewById, deleteReview, updateReview } from '../../models/vehicles.js';

/**
 * Delete the current user's own review
 * POST /dashboard/reviews/:id/delete
 */
const handleDeleteMyReview = async (req, res, next) => {
    const reviewId = parseInt(req.params.id, 10);
    if (Number.isNaN(reviewId)) {
        return next();
    }

    const userId = req.session?.user?.id;
    if (!userId) {
        req.flash('error', 'You must be logged in to delete a review.');
        return res.redirect('/login');
    }

    try {
        const review = await getReviewById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found or already deleted.');
            return res.redirect('/dashboard');
        }
        if (review.user_id !== userId) {
            req.flash('error', 'You can only delete your own reviews.');
            return res.redirect('/dashboard');
        }

        await deleteReview(reviewId);
        req.flash('success', 'Your review has been deleted.');
    } catch (err) {
        console.error('Error deleting review:', err);
        req.flash('error', 'Unable to delete review. Please try again later.');
    }

    return res.redirect('/dashboard');
};

/**
 * Edit the current user's own review
 * POST /dashboard/reviews/:id/edit
 */
const handleEditMyReview = async (req, res, next) => {
    const reviewId = parseInt(req.params.id, 10);
    if (Number.isNaN(reviewId)) {
        return next();
    }

    const userId = req.session?.user?.id;
    if (!userId) {
        req.flash('error', 'You must be logged in to edit a review.');
        return res.redirect('/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect('/dashboard');
    }

    try {
        const review = await getReviewById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found or already deleted.');
            return res.redirect('/dashboard');
        }

        if (review.user_id !== userId) {
            req.flash('error', 'You can only edit your own reviews.');
            return res.redirect('/dashboard');
        }

        const { rating, body } = req.body;
        await updateReview(reviewId, parseInt(rating, 10), body);
        req.flash('success', 'Your edits have been submitted! Please wait for an employee to review them before they appear.');
    } catch (err) {
        console.error('Error updating review:', err);
        req.flash('error', 'Unable to update review. Please try again later.');
    }

    return res.redirect('/dashboard');
};

export { handleDeleteMyReview, handleEditMyReview };

