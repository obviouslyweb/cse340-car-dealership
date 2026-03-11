-- Database seed file for car dealership
-- This file creates tables and inserts all initial data

-- Database Requirements:
-- Users table (with role field)
-- Vehicles table
-- Categories table (linked to vehicles)
-- Reviews table (linked to users and vehicles)
-- Service requests table (linked to users, with status tracking)
-- Contact messages table
-- Vehicle images table (one-to-many with vehicles)

BEGIN;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS vehicle_images CASCADE;

-- CREATE TABLE vehicles (
--     id INTEGER PRIMARY KEY,
--     -- TO BE COMPLETED
-- );

-- CREATE TABLE categories (
--     id INTEGER PRIMARY KEY,
--     -- TO BE COMPLETED
-- );

-- CREATE TABLE reviews (
--     id INTEGER PRIMARY KEY,
--     -- TO BE COMPLETED
-- );

-- CREATE TABLE service_requests (
--     id INTEGER PRIMARY KEY,
--     -- TO BE COMPLETED
-- );

-- CREATE TABLE contact_messages (
--     id INTEGER PRIMARY KEY,
--     -- TO BE COMPLETED
-- );

-- Leftovers from original template (will be removed once new format is completed)
-- Leftovers from original template (will be removed once new format is completed)
-- Leftovers from original template (will be removed once new format is completed)
DROP TABLE IF EXISTS catalog CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Create departments table
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credit_hours INTEGER NOT NULL CHECK (credit_hours > 0),
    department_id INTEGER NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create faculty table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    office VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    department_id INTEGER NOT NULL,
    title VARCHAR(100),
    gender VARCHAR(1),
    slug VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create catalog table
CREATE TABLE catalog (
    id SERIAL PRIMARY KEY,
    course_slug VARCHAR(250) NOT NULL,
    faculty_slug VARCHAR(200) NOT NULL,
    time VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_slug, faculty_slug, time, room)
);

-- Insert departments
INSERT INTO departments (id, code, name) VALUES
    (0, 'CS', 'Computer Science'),
    (1, 'MATH', 'Mathematics'),
    (2, 'ENG', 'English'),
    (3, 'INTL', 'International Studies'),
    (4, 'REL', 'Religious Education'),
    (5, 'GEN', 'General Studies'),
    (6, 'ENGR', 'Engineering'),
    (7, 'PHYS', 'Physics'),
    (8, 'CHEM', 'Chemistry'),
    (9, 'BIO', 'Biology'),
    (10, 'ECON', 'Economics'),
    (11, 'HIST', 'History');

-- Insert courses
INSERT INTO courses (course_code, name, description, credit_hours, department_id, slug) VALUES
    ('CSE 110', 'Introduction to Programming', 'Fundamentals of programming using Python. Introduction to problem solving, algorithm development, and basic programming concepts including variables, control structures, and functions.', 2, 0, 'cse-110'),
    ('CSE 111', 'Programming with Functions', 'Learn to become a more organized, efficient, and capable computer programmer by researching and calling functions written by others; writing, calling, debugging, and testing your own functions.', 2, 0, 'cse-111'),
    ('CSE 210', 'Programming with Classes', 'Introduction to the notion of classes and objects. Presents encapsulation at a conceptual level and works with inheritance and polymorphism.', 3, 0, 'cse-210'),
    ('CSE 212', 'Programming with Data Structures', 'Data structures and algorithms including dynamic arrays, linked lists, stacks, queues, trees, graphs, and hash tables. Algorithm analysis and Big O notation.', 3, 0, 'cse-212'),
    ('CSE 310', 'Operating Systems', 'Operating system concepts including processes, threads, CPU scheduling, memory management, file systems, and system security.', 3, 0, 'cse-310'),
    ('CSE 340', 'Software Engineering', 'Software development lifecycle, requirements analysis, design patterns, testing strategies, and project management in software development.', 3, 0, 'cse-340'),
    ('CSE 398', 'Computer Science Internship', 'Supervised work experience in computer science. Students apply classroom knowledge in real-world professional settings.', 3, 0, 'cse-398'),
    ('CIT 160', 'Introduction to Programming', 'Fundamental programming concepts using modern programming languages. Problem solving, algorithm development, and basic programming structures.', 3, 0, 'cit-160'),
    ('CIT 241', 'Network Routing and Switching', 'Initial router configuration, Cisco IOS Software management, routing protocol configuration, TCP/IP, and access control lists (ACLs).', 3, 0, 'cit-241'),
    ('CIT 260', 'Object Oriented Programming', 'Fundamentals of Object Oriented Programming using Java. Classes, objects, inheritance, polymorphism, and graphical user interfaces.', 3, 0, 'cit-260'),
    ('CIT 336', 'Web Backend Development', 'Server-side web development using modern frameworks and databases. RESTful APIs, authentication, and data management.', 3, 0, 'cit-336'),
    ('WDD 130', 'Web Fundamentals', 'Introduction to web development using HTML and CSS. Basic web page structure, styling, and responsive design principles.', 2, 0, 'wdd-130'),
    ('WDD 230', 'Web Frontend Development I', 'Advanced HTML, CSS, and JavaScript. DOM manipulation, event handling, and modern web development tools and practices.', 3, 0, 'wdd-230'),
    ('WDD 330', 'Web Frontend Development II', 'Advanced JavaScript frameworks and libraries. Single page applications, state management, and modern frontend development patterns.', 3, 0, 'wdd-330'),
    ('WDD 430', 'Full Stack Development', 'Integration of frontend and backend technologies. Database design, API development, and deployment of full-stack web applications.', 3, 0, 'wdd-430'),
    ('MATH 108X', 'Mathematics Preparation', 'Preparation for college-level mathematics. Review of algebra, geometry, and trigonometry concepts needed for calculus.', 3, 1, 'math-108x'),
    ('MATH 112', 'Calculus I', 'Limits, derivatives, and applications of derivatives. Introduction to integration and the Fundamental Theorem of Calculus.', 4, 1, 'math-112'),
    ('MATH 113', 'Calculus II', 'Integration techniques, applications of integration, infinite sequences and series, parametric equations, and polar coordinates.', 4, 1, 'math-113'),
    ('MATH 215', 'Calculus III', 'Multivariable calculus including partial derivatives, multiple integrals, vector fields, line integrals, and surface integrals.', 4, 1, 'math-215'),
    ('MATH 221', 'Statistics', 'Descriptive statistics, probability distributions, hypothesis testing, confidence intervals, regression analysis, and ANOVA.', 3, 1, 'math-221'),
    ('MATH 280', 'Topics in Pure Mathematics', 'Advanced mathematical topics including proof techniques, set theory, number theory, and abstract algebra concepts.', 3, 1, 'math-280'),
    ('MATH 341', 'Differential Equations', 'First and second order differential equations, systems of differential equations, and applications to physical and biological systems.', 3, 1, 'math-341'),
    ('ENG 106', 'English Preparation', 'Development of basic writing skills including grammar, sentence structure, paragraph development, and essay organization.', 3, 2, 'eng-106'),
    ('ENG 150', 'Writing and Reasoning Foundations', 'Academic writing with emphasis on critical thinking, research skills, and argumentation. Introduction to various rhetorical modes.', 3, 2, 'eng-150'),
    ('ENG 250', 'Writing and Research', 'Advanced academic writing with emphasis on research methodology, source evaluation, and scholarly communication.', 3, 2, 'eng-250'),
    ('ENG 216', 'Technical Writing', 'Writing for technical and professional audiences. Reports, proposals, manuals, and other forms of workplace communication.', 3, 2, 'eng-216'),
    ('ENG 295', 'Literature and Film', 'Study of literary works and their film adaptations. Analysis of narrative techniques, themes, and cultural contexts.', 3, 2, 'eng-295'),
    ('ENG 324', 'Shakespeare', 'Study of selected plays and sonnets by William Shakespeare with attention to language, themes, and historical context.', 3, 2, 'eng-324'),
    ('ENG 381', 'American Literature', 'Survey of American literature from colonial period to present, including major authors, movements, and cultural influences.', 3, 2, 'eng-381'),
    ('INTL 201', 'Introduction to International Studies', 'Overview of global issues, international relations theory, and cross-cultural analysis of political, economic, and social systems.', 3, 3, 'intl-201'),
    ('INTL 301', 'Comparative Politics', 'Comparative analysis of political systems, governance structures, and policy-making processes across different nations.', 3, 3, 'intl-301'),
    ('INTL 350', 'International Economics', 'Economic principles applied to international trade, finance, development, and global economic institutions.', 3, 3, 'intl-350'),
    ('INTL 401', 'Global Issues Seminar', 'In-depth analysis of contemporary global challenges including security, environment, human rights, and economic development.', 3, 3, 'intl-401'),
    ('REL 121', 'The Eternal Family', 'Doctrinal foundations of the family, marriage preparation, and principles of successful family relationships from an LDS perspective.', 2, 4, 'rel-121'),
    ('REL 250', 'The Living Christ', 'Study of the life, mission, and teachings of Jesus Christ as recorded in the New Testament and modern revelation.', 2, 4, 'rel-250'),
    ('FDMAT 108', 'Mathematics for Life', 'Practical applications of mathematics in personal finance, statistics, and problem-solving for daily life.', 3, 1, 'fdmat-108'),
    ('FDENG 101', 'Writing and Communication', 'Foundational writing and communication skills for academic and professional success.', 3, 2, 'fdeng-101'),
    ('GS 170', 'Foundations of Learning', 'Study skills, time management, goal setting, and strategies for academic success in higher education.', 2, 5, 'gs-170'),
    ('ECEN 160', 'Introduction to Electrical Engineering', 'Fundamentals of electrical engineering including circuit analysis, Ohms law, and basic electronic components.', 3, 6, 'ecen-160'),
    ('PHYS 121', 'University Physics I', 'Mechanics, wave motion, and thermodynamics with calculus-based approach. Laboratory component included.', 4, 7, 'phys-121'),
    ('CHEM 111', 'General Chemistry I', 'Fundamental principles of chemistry including atomic structure, bonding, stoichiometry, and thermochemistry.', 4, 8, 'chem-111'),
    ('BIO 111', 'General Biology I', 'Introduction to biological principles including cell structure, metabolism, genetics, and evolution.', 4, 9, 'bio-111'),
    ('ECON 151', 'Macroeconomics', 'Introduction to macroeconomic principles including national income, inflation, unemployment, and fiscal policy.', 3, 10, 'econ-151'),
    ('HIST 170', 'Foundations of the Restoration', 'History of the restoration of the Gospel of Jesus Christ through the Prophet Joseph Smith and the early Church.', 2, 11, 'hist-170');

-- Insert faculty
INSERT INTO faculty (first_name, last_name, office, phone, email, department_id, title, gender, slug) VALUES
    ('Nathan', 'Jack', 'STC 310A', '208-496-7622', 'jackn@byui.edu', 0, 'Department Chair', 'm', 'nathan-jack'),
    ('Jason', 'Allred', 'STC 310B', '208-496-7607', 'allredjas@byui.edu', 0, 'Associate Chair', 'm', 'jason-allred'),
    ('Adam', 'Hayes', 'STC 310C', '208-496-3782', 'hayesa@byui.edu', 0, 'Associate Chair', 'm', 'adam-hayes'),
    ('Nate', 'Phillips', 'STC 310D', '208-496-7625', 'phillipsn@byui.edu', 0, 'Associate Chair', 'm', 'nate-phillips'),
    ('William', 'Clements', 'STC 310E', '208-496-7617', 'clementsw@byui.edu', 0, 'Program Lead', 'm', 'william-clements'),
    ('Zachariah', 'Alvey', 'STC 330A', '208-496-3741', 'alveyz@byui.edu', 0, 'Professor', 'm', 'zachariah-alvey'),
    ('Bradley', 'Armstrong', 'STC 330B', '208-496-3766', 'armstrongb@byui.edu', 0, 'Professor', 'm', 'bradley-armstrong'),
    ('Lee', 'Barney', 'STC 330C', '208-496-3767', 'barneyl@byui.edu', 0, 'Professor', 'm', 'lee-barney'),
    ('Rex', 'Barzee', 'STC 330D', '208-496-3768', 'barzeer@byui.edu', 0, 'Professor', 'm', 'rex-barzee'),
    ('Scott', 'Burton', 'STC 330E', '208-496-7614', 'burtons@byui.edu', 0, 'Professor', 'm', 'scott-burton'),
    ('Christopher', 'Keers', 'STC 330F', '208-496-7604', 'keersc@byui.edu', 0, 'Professor', 'm', 'christopher-keers'),
    ('Julie Ann', 'Anderson', 'STC 330G', '208-496-4505', 'andersonju@byui.edu', 0, 'Professor', 'f', 'julie-ann-anderson'),
    ('Joelle', 'Moen', 'GEB 205A', '208-496-4391', 'moenj@byui.edu', 2, 'Department Chair', 'f', 'joelle-moen'),
    ('Josh', 'Allen', 'GEB 205B', '208-496-4366', 'allenj@byui.edu', 2, 'Professor', 'm', 'josh-allen'),
    ('Matt', 'Babcock', 'GEB 205C', '208-496-4367', 'babcockm@byui.edu', 2, 'Professor', 'm', 'matt-babcock'),
    ('Jeremy', 'Bailey', 'GEB 205D', '208-496-4405', 'baileyj@byui.edu', 2, 'Professor', 'm', 'jeremy-bailey'),
    ('Tom', 'Ballard', 'GEB 205E', '208-496-4342', 'ballardt@byui.edu', 2, 'Professor', 'm', 'tom-ballard'),
    ('Mark', 'Bennion', 'GEB 205F', '208-496-4368', 'bennionm@byui.edu', 2, 'Professor', 'm', 'mark-bennion'),
    ('William', 'Brugger', 'GEB 205G', '208-496-4370', 'bruggerw@byui.edu', 2, 'Professor', 'm', 'william-brugger'),
    ('Curtis', 'Chandler', 'GEB 205H', '208-496-4132', 'chandlerc@byui.edu', 2, 'Professor', 'm', 'curtis-chandler'),
    ('Anna', 'Durfee', 'GEB 205I', '208-496-4304', 'durfeean@byui.edu', 2, 'Professor', 'f', 'anna-durfee'),
    ('Elaine', 'Wagner', 'MC 301A', '208-496-7556', 'wagnere@byui.edu', 1, 'Department Chair', 'f', 'elaine-wagner'),
    ('Brett', 'Amidan', 'MC 301B', '208-496-7563', 'amidanb@byui.edu', 1, 'Professor', 'm', 'brett-amidan'),
    ('Dave', 'Brown', 'MC 301C', '208-496-7527', 'brownd@byui.edu', 1, 'Professor', 'm', 'dave-brown'),
    ('Greg', 'Cameron', 'MC 301D', '208-496-7528', 'camerong@byui.edu', 1, 'Professor', 'm', 'greg-cameron'),
    ('Paul', 'Cannon', 'MC 301E', '208-496-7565', 'cannonp@byui.edu', 1, 'Professor', 'm', 'paul-cannon'),
    ('Paul', 'Cox', 'MC 301F', '208-496-7529', 'coxp@byui.edu', 1, 'Professor', 'm', 'paul-cox'),
    ('Craig', 'Johnson', 'MC 301G', '208-496-7539', 'johnsonc@byui.edu', 1, 'Professor', 'm', 'craig-johnson'),
    ('Chaz', 'Clark', 'MC 301H', '208-496-7535', 'clarkty@byui.edu', 1, 'Professor', 'm', 'chaz-clark'),
    ('Robert', 'Colvin', 'LA 201A', '208-496-4308', 'colvinr@byui.edu', 3, 'Professor', 'm', 'robert-colvin'),
    ('Scott', 'Galer', 'LA 201B', '208-496-4310', 'galers@byui.edu', 3, 'Professor', 'm', 'scott-galer'),
    ('John', 'Ivers', 'LA 201C', '208-496-4313', 'iversj@byui.edu', 3, 'Professor', 'm', 'john-ivers'),
    ('Jeremy', 'Lamoreaux', 'LA 201D', '208-496-4234', 'lamoreauxj@byui.edu', 3, 'Professor', 'm', 'jeremy-lamoreaux'),
    ('Trever', 'McKay', 'LA 201E', '208-496-4312', 'mckaytr@byui.edu', 3, 'Department Chair', 'm', 'trever-mckay'),
    ('Michael', 'Paul', 'LA 201F', '208-496-4315', 'paulm@byui.edu', 3, 'Professor', 'm', 'michael-paul');
-- Leftovers from original template (will be removed once new format is completed)
-- Leftovers from original template (will be removed once new format is completed)
-- Leftovers from original template (will be removed once new format is completed)

COMMIT;