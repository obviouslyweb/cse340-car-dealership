// Route handlers for static pages
import { getFeaturedVehicles } from '../models/vehicles.js';

const homePage = async (req, res) => {
    const featuredVehicles = await getFeaturedVehicles();
    res.render('home', { title: 'Home', featuredVehicles });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About' });
};

export { homePage, aboutPage };