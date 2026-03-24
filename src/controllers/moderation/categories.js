import { Router } from 'express';
import { validationResult } from 'express-validator';
import { getCategoriesWithVehicleCounts, createCategory, updateCategory, deleteCategory } from '../../models/category.js';
import { categoryCreateValidation, categoryUpdateValidation } from '../../middleware/validation/forms.js';

const router = Router();

const isCategoryNameUniqueViolation = (err) => {
    if (!err || err.code !== '23505') return false;
    const constraint = String(err.constraint || '');
    const detail = String(err.detail || '');
    return (
        /name/i.test(constraint) ||
        detail.includes('(name)=') ||
        detail.toLowerCase().includes('key (name)')
    );
};

/**
 * GET /moderation/categories
 */
const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getCategoriesWithVehicleCounts();
        res.render('moderation/categories', {
            title: 'Vehicle Categories',
            categories: categories || []
        });
    } catch (err) {
        console.error('Error loading categories page:', err);
        req.flash('error', 'Unable to load categories. Please try again later.');
        res.redirect('/dashboard');
    }
};

/**
 * POST /moderation/categories — add category
 */
const handleCreateCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((e) => req.flash('error', e.msg));
        return res.redirect('/moderation/categories');
    }

    const { name, description } = req.body;
    try {
        await createCategory(name, description || null);
        req.flash('success', 'Category added successfully.');
    } catch (err) {
        console.error('Error creating category:', err);
        if (isCategoryNameUniqueViolation(err)) {
            req.flash('error', 'A category with that name already exists.');
        } else {
            req.flash('error', 'Unable to add the category. Please try again later.');
        }
    }
    return res.redirect('/moderation/categories');
};

/**
 * POST /moderation/categories/:id/update
 */
const handleUpdateCategory = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.redirect('/moderation/categories');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((e) => req.flash('error', e.msg));
        return res.redirect('/moderation/categories');
    }

    const { name, description } = req.body;
    try {
        const updated = await updateCategory(id, name, description || null);
        if (!updated) {
            req.flash('error', 'Category not found.');
        } else {
            req.flash('success', 'Category updated successfully.');
        }
    } catch (err) {
        console.error('Error updating category:', err);
        if (isCategoryNameUniqueViolation(err)) {
            req.flash('error', 'Another category already uses that name.');
        } else {
            req.flash('error', 'Unable to update the category. Please try again later.');
        }
    }
    return res.redirect('/moderation/categories');
};

/**
 * POST /moderation/categories/:id/delete
 */
const handleDeleteCategory = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.redirect('/moderation/categories');
    }

    try {
        const result = await deleteCategory(id);
        if (result.deleted) {
            req.flash('success', 'Category deleted successfully.');
        } else if (result.reason === 'in_use') {
            req.flash(
                'error',
                `Cannot delete this category while ${result.vehicleCount} vehicle(s) are assigned to it. Reassign or remove those vehicles first.`
            );
        } else {
            req.flash('error', 'Category not found.');
        }
    } catch (err) {
        console.error('Error deleting category:', err);
        req.flash('error', 'Unable to delete the category. Please try again later.');
    }
    return res.redirect('/moderation/categories');
};

router.get('/', showCategoriesPage);
router.post('/create', categoryCreateValidation, handleCreateCategory);
router.post('/:id/update', categoryUpdateValidation, handleUpdateCategory);
router.post('/:id/delete', handleDeleteCategory);

export default router;
