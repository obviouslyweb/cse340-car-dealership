import db from './db.js';

/**
 * Records an application event for the admin activity log
 */
const logActivity = async ({ actorUserId, action, targetType = null, targetId = null, details = null }) => {
    try {
        await db.query(
            `INSERT INTO activity_log (actor_user_id, action, target_type, target_id, details)
             VALUES ($1, $2, $3, $4, $5)`,
            [actorUserId ?? null, action, targetType, targetId, details]
        );
    } catch (err) {
        console.error('activity_log insert failed:', err.message);
    }
};

/**
 * Paginated activity log for admin UI (newest first)
 */
const getActivityLogPage = async (page = 1, pageSize = 100) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeSize = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 100));
    const offset = (safePage - 1) * safeSize;

    const countResult = await db.query('SELECT COUNT(*)::int AS total FROM activity_log');
    const total = countResult.rows[0]?.total ?? 0;

    const rowsResult = await db.query(
        `SELECT
            al.id,
            al.created_at,
            al.action,
            al.target_type,
            al.target_id,
            al.details,
            COALESCE(u.name, '—') AS actor_name
         FROM activity_log al
         LEFT JOIN users u ON u.id = al.actor_user_id
         ORDER BY al.created_at DESC, al.id DESC
         LIMIT $1 OFFSET $2`,
        [safeSize, offset]
    );

    return {
        entries: rowsResult.rows,
        total,
        page: safePage,
        pageSize: safeSize,
        totalPages: Math.max(1, Math.ceil(total / safeSize))
    };
};

export { logActivity, getActivityLogPage };
