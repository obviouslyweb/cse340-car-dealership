import { validationResult } from 'express-validator';
import { updateVehicle } from '../../models/vehicles.js';

/**
 * Handle employee/admin vehicle edits from the vehicle detail page.
 */
const handleVehicleEdit = async (req, res, next) => {
    const vehicleId = parseInt(req.params.id, 10);
    if (Number.isNaN(vehicleId)) {
        return next();
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect(`/vehicles/${vehicleId}`);
    }

    const { category_id, make, model, year, price, mileage, stock, description } = req.body;

    try {
        const updatedVehicle = await updateVehicle(vehicleId, {
            categoryId: parseInt(category_id, 10),
            make,
            model,
            year: parseInt(year, 10),
            price: parseFloat(price),
            mileage: mileage === '' || mileage == null ? null : parseInt(mileage, 10),
            stock: parseInt(stock, 10),
            isFeatured: req.body.is_featured === 'true',
            description: description || null
        });

        if (!updatedVehicle) {
            req.flash('error', 'Vehicle not found.');
            return res.redirect('/vehicles');
        }

        req.flash('success', 'Vehicle details updated successfully.');
        return res.redirect(`/vehicles/${vehicleId}`);
    } catch (err) {
        console.error('Error updating vehicle:', err);
        req.flash('error', 'Unable to update the vehicle right now. Please try again later.');
        return res.redirect(`/vehicles/${vehicleId}`);
    }
};

export { handleVehicleEdit };
