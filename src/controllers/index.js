// Route handlers for static pages
import { getFeaturedVehicles, getVehicles, getVehicleById, getCategories } from '../models/vehicles.js';

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
    res.render('vehicles/detail', { title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, vehicle });
};

export { homePage, aboutPage, vehicleListPage, vehicleDetailPage };