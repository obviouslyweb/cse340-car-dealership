# cse340-car-dealership
Project repository for the CSE 340 final project, a car dealership site made with Express and node.js.

## Project Description
As per the requirements for option 2 of the final project, this site will be a used car dealership website with these features:
### Public Pages
* Home page with featured vehicles
* Browse vehicles by category (Trucks, Vans, Cars, SUVs)
* Individual vehicle detail pages with images, specs, and price
* Contact form (saves to database)
### User Features (must be logged in)
* Leave reviews on vehicles
* Edit/delete own reviews
* Submit service requests for their vehicle (oil change, inspection, etc.)
* View history of service requests and their status
### Employee Dashboard:
* Edit vehicle details (price, description, availability)
* Moderate/delete inappropriate reviews
* View and manage service requests
* Update service request status (Submitted, In Progress, Completed)
* Add notes to service requests
* View contact form submissions
### Owner Dashboard (Full Admin):
* Everything employees can do, plus:
* Add, edit, and delete vehicle categories
* Add, edit, and delete vehicles from inventory
* Manage employee accounts (optional, can be hardcoded)
* View all system activity and user data
### Database Requirements:
Database Requirements:
* Users table (with role field)
* Vehicles table
* Categories table (linked to vehicles)
* Reviews table (linked to users and vehicles)
* Service requests table (linked to users, with status tracking)
* Contact messages table
* Vehicle images table (one-to-many with vehicles)

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
- [ ] Organized folder structure
- [ ] Clean, readable code with consistent formatting

### Technology Stack
Required Technologies:
* Node.js with Express.js as the backend framework
* EJS or Liquid.js for rendering views
* ESM (ECMAScript Modules), no CommonJS (require is not allowed)
* PostgreSQL for the database
* Deployed on Render with a connected PostgreSQL database
