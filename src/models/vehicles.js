import db from './db.js';

/**
 * Fetches all featured vehicles with their primary image URL
 */
const getFeaturedVehicles = async () => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description, v.stock, vi.image_url, ROUND(AVG(r.rating)::numeric, 1) AS average_rating
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        LEFT JOIN reviews r ON r.vehicle_id = v.id AND r.is_visible = TRUE
        WHERE v.is_featured = TRUE AND v.stock > 0
        GROUP BY v.id, vi.image_url
        ORDER BY v.id
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Fetches vehicles with their primary image URL
 */
const getVehicles = async ({ categoryId, includeUnavailable = false } = {}) => {
    const conditions = [];
    const params = [];

    if (!includeUnavailable) {
        conditions.push('v.stock > 0');
    }
    if (categoryId) {
        params.push(categoryId);
        conditions.push(`v.category_id = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT v.id, v.category_id, v.make, v.model, v.year, v.price, v.mileage, v.is_featured, v.description, v.stock, vi.image_url, ROUND(AVG(r.rating)::numeric, 1) AS average_rating
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        LEFT JOIN reviews r ON r.vehicle_id = v.id AND r.is_visible = TRUE
        ${whereClause}
        GROUP BY v.id, vi.image_url
        ORDER BY v.id
    `;

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Fetches a single vehicle by ID with its primary image URL
 */
const getVehicleById = async (id) => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description, v.category_id, v.stock, v.is_featured, vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Fetches all images for a vehicle (primary first, then by id)
 */
const getVehicleImages = async (vehicleId) => {
    const query = `
        SELECT id, image_url, is_primary
        FROM vehicle_images
        WHERE vehicle_id = $1
        ORDER BY is_primary DESC, id
    `;
    const result = await db.query(query, [vehicleId]);
    return result.rows;
};

/**
 * Updates a vehicle's editable fields
 */
const updateVehicle = async (id, vehicleData) => {
    const query = `
        UPDATE vehicles
        SET category_id = $2,
            make = $3,
            model = $4,
            year = $5,
            price = $6,
            mileage = $7,
            stock = $8,
            is_featured = $9,
            description = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, category_id, make, model, year, price, mileage, stock, is_featured, description, updated_at
    `;

    const params = [
        id,
        vehicleData.categoryId,
        vehicleData.make.trim(),
        vehicleData.model.trim(),
        vehicleData.year,
        vehicleData.price,
        vehicleData.mileage,
        vehicleData.stock,
        vehicleData.isFeatured,
        vehicleData.description && vehicleData.description.trim() ? vehicleData.description.trim() : null
    ];

    const result = await db.query(query, params);
    return result.rows[0] || null;
};

/**
 * Deletes a vehicle by id
 * Related rows in vehicle_images and reviews cascade
 */
const deleteVehicle = async (id) => {
    const query = 'DELETE FROM vehicles WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

/**
 * Insert a new vehicle (id, created_at, updated_at are database-generated)
 */
const createVehicle = async (vehicleData) => {
    const query = `
        INSERT INTO vehicles (
            category_id, make, model, year, price, mileage, stock, is_featured, description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    `;
    const params = [
        vehicleData.categoryId,
        vehicleData.make.trim(),
        vehicleData.model.trim(),
        vehicleData.year,
        vehicleData.price,
        vehicleData.mileage,
        vehicleData.stock,
        vehicleData.isFeatured,
        vehicleData.description && vehicleData.description.trim() ? vehicleData.description.trim() : null
    ];
    const result = await db.query(query, params);
    return result.rows[0]?.id ?? null;
};

export { getFeaturedVehicles, getVehicles, getVehicleById, getVehicleImages, updateVehicle, deleteVehicle, createVehicle };
