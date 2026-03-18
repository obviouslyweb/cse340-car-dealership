// Route handlers for static pages
import { validationResult } from 'express-validator';
import { getFeaturedVehicles, getVehicles, getVehicleById, getVehicleImages, getCategories, getReviewsByVehicleId, getAggregateReviewScoreByVehicleId, createReview } from '../models/vehicles.js';

const homePage = async (req, res) => {
    const featuredVehicles = await getFeaturedVehicles();
    res.render('home', { title: 'Home', featuredVehicles });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About' });
};

const vehicleListPage = async (req, res) => {
    const categories = await getCategories();

    const categoryIdParam = parseInt(req.query.categoryId, 10);
    const validCategoryIds = new Set(categories.map((cat) => cat.id));
    const currentCategoryId = Number.isInteger(categoryIdParam) && validCategoryIds.has(categoryIdParam)
        ? categoryIdParam
        : null;

    const showUnavailable = req.query.showUnavailable === '1';

    const vehicles = await getVehicles({
        categoryId: currentCategoryId || undefined,
        includeUnavailable: showUnavailable
    });

    res.render('vehicles/list', {
        title: 'Vehicles',
        vehicles,
        categories,
        currentCategoryId,
        showUnavailable
    });
};

const vehicleDetailPage = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return next();
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
        return next();
    }

    const vehicleImages = await getVehicleImages(id);
    const categories = await getCategories();
    const reviews = await getReviewsByVehicleId(id);
    const aggregateReview = await getAggregateReviewScoreByVehicleId(id);
    const showUnavailable = req.query.showUnavailable === '1';
    const categoryIdParam = parseInt(req.query.categoryId, 10);
    const validCategoryIds = new Set((categories || []).map((cat) => cat.id));
    
    const currentCategoryId = Number.isInteger(categoryIdParam) && validCategoryIds.has(categoryIdParam)
        ? categoryIdParam
        : null;

    const currentUserName = (req.session && req.session.user) ? req.session.user.name : null;

    res.render('vehicles/detail', {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        vehicle,
        vehicleImages: vehicleImages || [],
        categories: categories || [],
        showUnavailable,
        currentCategoryId,
        reviews: reviews || [],
        aggregateReview,
        currentUserName
    });
};

const handleReviewSubmission = async (req, res, next) => {
    const vehicleId = parseInt(req.params.id, 10);
    if (Number.isNaN(vehicleId)) {
        return next();
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((err) => req.flash('error', err.msg));
        return res.redirect(`/vehicles/${vehicleId}`);
    }

    const userId = req.session && req.session.user ? req.session.user.id : null;
    if (!userId) {
        req.flash('error', 'You must be logged in to submit a review.');
        return res.redirect(`/vehicles/${vehicleId}`);
    }

    const { rating, body } = req.body;
    try {
        await createReview(vehicleId, userId, parseInt(rating, 10), body.trim());
        req.flash('success', 'Thank you! Your review has been submitted and will be visible after moderation.');
        return res.redirect(`/vehicles/${vehicleId}`);
    } catch (err) {
        console.error('Error saving review:', err);
        req.flash('error', 'Unable to submit your review. Please try again later.');
        return res.redirect(`/vehicles/${vehicleId}`);
    }
};

export { homePage, aboutPage, vehicleListPage, vehicleDetailPage, handleReviewSubmission };