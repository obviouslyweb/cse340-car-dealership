# cse340-car-dealership / Fuse Automobiles
Project repository for the CSE 340 final project, a car dealership site made with Express and node.js.
https://fuse-automobile.onrender.com/

## Project Description
As per the requirements for option 2 of the final project, this site will be a used car dealership website with these features:
### Public Pages
* [X] Home page with featured vehicles
* [X] Browse vehicles by category (Trucks, Vans, Cars, SUVs)
* [X] Individual vehicle detail pages with images, specs, and price
* [X] Contact form (saves to database)
### User Features (must be logged in)
* [X] Leave reviews on vehicles
* [X] Edit/delete own reviews
* [ ] Submit service requests for their vehicle (oil change, inspection, etc.)
* [ ] View history of service requests and their status
### Employee Dashboard:
* [ ] Edit vehicle details (price, description, availability)
* [X] Moderate/delete inappropriate reviews
* [ ] View and manage service requests
* [ ] Update service request status (Submitted, In Progress, Completed)
* [ ] Add notes to service requests
* [X] View contact form submissions
### Owner Dashboard (Full Admin):
* [ ] Everything employees can do, plus:
* [ ] Add, edit, and delete vehicle categories
* [ ] Add, edit, and delete vehicles from inventory
* [ ] Manage employee accounts (optional, can be hardcoded)
* [ ] View all system activity and user data
### Database Requirements:
Database Requirements:
* [X] Users table (with role field)
* [X] Vehicles table
* [X] Categories table (linked to vehicles)
* [X] Reviews table (linked to users and vehicles)
* [X] Service requests table (linked to users, with status tracking)
* [X] Contact messages table
* [X] Vehicle images table (one-to-many with vehicles)

## Database Schema:
- [ ] An image of your entity relation diagram (ERD) exported from pgAdmin showing your tables and relationships

## User Roles
- [ ] Explanation of each role and what they can do

## Test Account Credentials
- [ ] Username or email for one account of each role type; do not include the password in the README! See Final Project Requirements document for details about what the password should be

## Known Limitations
- [ ] Description of any features you did not complete or bugs you are aware of.

## Final Details (delete once verified)
Additionally, your GitHub repository must show:
- [ ] Minimum 15 substantial commits (not simple one-line fixes)
- [X] Organized folder structure
- [X] Clean, readable code with consistent formatting

### Technology Stack
Required Technologies:
* [X] Node.js with Express.js as the backend framework
* [X] EJS or Liquid.js for rendering views
* [X] ESM (ECMAScript Modules), no CommonJS (require is not allowed)
* [X] PostgreSQL for the database
* [X] Deployed on Render with a connected PostgreSQL database

## Implementation Steps

Here's a list of everything that I have left to do until completion in order.

* [ ] Logged-in users can submit service requests
* [ ] Dashboard shows service request history and status
* [ ] Employees can edit vehicle details (price, description, availability)
* [ ] Employees can view and manage service requests, update status, add notes
* [ ] Admin can add, edit, delete vehicle categories
* [ ] Admin can add, edit, delete vehicles
* [ ] Admin can manage employee accounts and view activity or user data (if required)
* [ ] Mobile view handling for all pages
* [ ] User Roles section filled in README
* [ ] Test account credentials in README (email only, no password)
* [ ] ERD image in README (pgAdmin export)
* [ ] Known Limitations section filled in README
* [ ] Review & polish core
* [ ] Review & polish README
