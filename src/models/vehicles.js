import db from './db.js';

/**
 * Fetches all featured vehicles with their primary (featured) image URL.
 *
 * @returns {Promise<Array>} Array of vehicles with id, make, model, year, price, description, image_url
 */
const getFeaturedVehicles = async () => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.is_featured = TRUE AND v.is_available = TRUE
        ORDER BY v.id
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Fetches all available vehicles with their primary image URL.
 *
 * @returns {Promise<Array>} Array of vehicles with id, make, model, year, price, description, image_url
 */
const getVehicles = async () => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.is_available = TRUE
        ORDER BY v.id
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Fetches a single vehicle by ID with its primary image URL.
 *
 * @param {number} id - Vehicle ID
 * @returns {Promise<Object|null>} Vehicle record or null if not found
 */
const getVehicleById = async (id) => {
    const query = `
        SELECT v.id, v.make, v.model, v.year, v.price, v.mileage, v.description,
               v.category_id, v.is_available,
               vi.image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

export { getFeaturedVehicles, getVehicles, getVehicleById };
