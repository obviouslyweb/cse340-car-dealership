// Route handlers for static pages
import { getFeaturedVehicles, getVehicles, getVehicleById } from '../models/vehicles.js';

const homePage = async (req, res) => {
    const featuredVehicles = await getFeaturedVehicles();
    res.render('home', { title: 'Home', featuredVehicles });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About' });
};

const vehicleListPage = async (req, res) => {
    const vehicles = await getVehicles();
    res.render('vehicles/list', { title: 'Vehicles', vehicles });
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

// const testErrorPage = (req, res, next) => {
//     const err = new Error('This is a test error');
//     err.status = 500;
//     next(err);
// };

export { homePage, aboutPage, vehicleListPage, vehicleDetailPage };