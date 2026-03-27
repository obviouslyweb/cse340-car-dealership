import { Router } from 'express';
import { getReviewsAwaitingApproval, approveReview, deleteReview } from '../../models/reviews.js';
import { logActivity } from '../../models/log.js';

const router = Router();

/**
 * List all unapproved reviews for employees/admins
 * GET /moderation/reviews
 */
const showModerationPage = async (req, res) => {
    try {
        const reviews = await getReviewsAwaitingApproval();
        res.render('moderation/reviews', {
            title: 'Moderate Submitted Reviews',
            reviews: reviews || []
        });
    } catch (err) {
        console.error('Error loading reviews for moderation:', err);
        req.flash('error', 'Unable to load reviews. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * Mark review as visible
 * POST /moderation/reviews/:id/approve
 */
const handleApprove = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }
    try {
        const row = await approveReview(id);
        if (row) {
            await logActivity({
                actorUserId: req.session?.user?.id,
                action: 'review.approve',
                targetType: 'review',
                targetId: id,
                details: row.vehicle_id != null ? `Vehicle #${row.vehicle_id}` : null
            });
            req.flash('success', 'Review approved. It is now visible on the vehicle page.');
        } else {
            req.flash('error', 'Review not found or already approved.');
        }
    } catch (err) {
        console.error('Error approving review:', err);
        req.flash('error', 'Unable to approve review. Please try again later.');
    }
    res.redirect('/moderation/reviews');
};

/**
 * Delete review after confirmation
 * POST /moderation/reviews/:id/reject
 */
const handleReject = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }
    try {
        const row = await deleteReview(id);
        if (row) {
            await logActivity({
                actorUserId: req.session?.user?.id,
                action: 'review.reject',
                targetType: 'review',
                targetId: id,
                details: null
            });
            req.flash('success', 'Review rejected and removed.');
        } else {
            req.flash('error', 'Review not found or already removed.');
        }
    } catch (err) {
        console.error('Error rejecting review:', err);
        req.flash('error', 'Unable to reject review. Please try again later.');
    }
    res.redirect('/moderation/reviews');
};

router.get('/', showModerationPage);
router.post('/:id/approve', handleApprove);
router.post('/:id/reject', handleReject);

export default router;
