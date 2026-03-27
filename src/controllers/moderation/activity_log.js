import { Router } from 'express';
import { getActivityLogPage } from '../../models/log.js';

const router = Router();

/**
 * GET /moderation/activity-log
 */
const showActivityLogPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const data = await getActivityLogPage(page, 100);
        res.render('moderation/activity_log', {
            title: 'Database Activity Log',
            ...data,
            user: req.session?.user || null
        });
    } catch (err) {
        console.error('Error loading activity log:', err);
        req.flash('error', 'Unable to load the activity log. Please try again later.');
        res.redirect('/dashboard');
    }
};

router.get('/', showActivityLogPage);

export default router;
