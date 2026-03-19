import db from '../db.js';

/** ervice_type enum values */
export const SERVICE_TYPES = [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Battery Replacement',
    'Filter Replacement',
    'Multi-Point Inspection',
    'Fluid Flush',
    'Alignment',
    'Other'
];

/**
 * Inserts a new service request
 */
const createServiceRequest = async (userId, serviceType, vehicleName, description) => {
    const query = `
        INSERT INTO service_requests (user_id, service_type, vehicle_name, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await db.query(query, [
        userId,
        serviceType,
        vehicleName.trim().slice(0, 50),
        description && description.trim() ? description.trim() : null
    ]);
    return result.rows[0];
};

/**
 * Gets a single service request by id
 */
const getServiceRequestById = async (id) => {
    const query = `
        SELECT id, user_id, service_type, vehicle_name, description, status, employee_notes, status_facing_user, created_at, updated_at
        FROM service_requests
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Gets all service requests submitted by a user
 */
const getServiceRequestsByUserId = async (userId) => {
    const query = `
        SELECT id, user_id, service_type, vehicle_name, description, status, employee_notes, status_facing_user, created_at, updated_at
        FROM service_requests
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Updates a service request
 */
const updateServiceRequest = async (id, serviceType, vehicleName, description) => {
    const query = `
        UPDATE service_requests
        SET service_type = $2,
            vehicle_name = $3,
            description = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, user_id, service_type, vehicle_name, description, status, updated_at
    `;
    const result = await db.query(query, [
        id,
        serviceType,
        vehicleName.trim().slice(0, 50),
        description && description.trim() ? description.trim() : null
    ]);
    return result.rows[0] || null;
};

/**
 * Gets all service requests for moderation
 */
const getAllServiceRequestsForModeration = async () => {
    const query = `
        SELECT sr.id, sr.user_id, sr.service_type, sr.vehicle_name, sr.description,
               sr.status, sr.employee_notes, sr.status_facing_user, sr.created_at, sr.updated_at,
               u.name AS user_name
        FROM service_requests sr
        INNER JOIN users u ON sr.user_id = u.id
        ORDER BY sr.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Updates status, employee_notes, and status_facing_user
 */
const updateServiceRequestByStaff = async (id, status, employeeNotes, statusFacingUser) => {
    const query = `
        UPDATE service_requests
        SET status = $2,
            employee_notes = $3,
            status_facing_user = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, status, employee_notes, status_facing_user, updated_at
    `;
    const result = await db.query(query, [
        id,
        status,
        employeeNotes != null && String(employeeNotes).trim() !== '' ? String(employeeNotes).trim() : null,
        statusFacingUser != null && String(statusFacingUser).trim() !== '' ? String(statusFacingUser).trim() : null
    ]);
    return result.rows[0] || null;
};

/**
 * Deletes a service request
 */
const deleteServiceRequest = async (id) => {
    const query = `DELETE FROM service_requests WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

export { createServiceRequest, getServiceRequestById, getServiceRequestsByUserId, updateServiceRequest, getAllServiceRequestsForModeration, updateServiceRequestByStaff, deleteServiceRequest };