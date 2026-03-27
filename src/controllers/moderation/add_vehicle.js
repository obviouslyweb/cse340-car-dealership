import { Router } from 'express';
import { validationResult } from 'express-validator';
import { getCategories } from '../../models/category.js';
import { createVehicle } from '../../models/vehicles.js';
import { logActivity } from '../../models/log.js';
import { vehicleEditValidation } from '../../middleware/validation/forms.js';

const router = Router();

/**
 * GET /moderation/add_vehicle
 */
const showAddVehiclePage = async (req, res) => {
    try {
        const categories = await getCategories();
        res.render('moderation/add_vehicle', {
            title: 'Add Vehicle',
            categories: categories || []
        });
    } catch (err) {
        console.error('Error loading add vehicle page:', err);
        req.flash('error', 'Unable to load the form. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * POST /moderation/add_vehicle
 */
const handleAddVehicle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((e) => req.flash('error', e.msg));
        return res.redirect('/moderation/add_vehicle');
    }

    const { category_id, make, model, year, price, mileage, stock, description } = req.body;

    try {
        const newId = await createVehicle({
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

        if (!newId) {
            req.flash('error', 'Could not create the vehicle.');
            return res.redirect('/moderation/add_vehicle');
        }

        await logActivity({
            actorUserId: req.session?.user?.id,
            action: 'vehicle.create',
            targetType: 'vehicle',
            targetId: newId,
            details: `${year} ${make} ${model}`
        });

        req.flash('success', 'Vehicle added successfully.');
        return res.redirect(`/vehicles/${newId}`);
    } catch (err) {
        console.error('Error creating vehicle:', err);
        req.flash('error', 'Unable to add the vehicle. Please try again later.');
        return res.redirect('/moderation/add_vehicle');
    }
};

router.get('/', showAddVehiclePage);
router.post('/', vehicleEditValidation, handleAddVehicle);

export default router;
