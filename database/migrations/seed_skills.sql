-- Seed Skills Data

INSERT IGNORE INTO skills (name, description, category, difficulty_level) VALUES
-- Technical Skills - Frontend
('React', 'JavaScript library for building user interfaces', 'Technical', 'Intermediate'),
('TypeScript', 'Typed superset of JavaScript', 'Technical', 'Intermediate'),
('JavaScript', 'Programming language for web development', 'Technical', 'Beginner'),
('HTML5', 'Markup language for structuring web pages', 'Technical', 'Beginner'),
('CSS3', 'Styling language for web pages', 'Technical', 'Beginner'),
('Tailwind CSS', 'Utility-first CSS framework', 'Technical', 'Intermediate'),
('Vue.js', 'Progressive JavaScript framework', 'Technical', 'Intermediate'),
('Angular', 'TypeScript-based web application framework', 'Technical', 'Advanced'),

-- Technical Skills - Backend
('Node.js', 'JavaScript runtime for server-side development', 'Technical', 'Intermediate'),
('Express.js', 'Web application framework for Node.js', 'Technical', 'Intermediate'),
('Python', 'High-level programming language', 'Technical', 'Beginner'),
('Java', 'Object-oriented programming language', 'Technical', 'Intermediate'),
('C#', 'Object-oriented programming language by Microsoft', 'Technical', 'Intermediate'),
('RESTful API', 'Architecture for web services', 'Technical', 'Intermediate'),
('GraphQL', 'Query language for APIs', 'Technical', 'Advanced'),
('Microservices', 'Architectural approach to software development', 'Technical', 'Advanced'),

-- Technical Skills - Database
('MySQL', 'Relational database management system', 'Technical', 'Beginner'),
('PostgreSQL', 'Advanced open-source relational database', 'Technical', 'Intermediate'),
('MongoDB', 'NoSQL document database', 'Technical', 'Intermediate'),
('Database Design', 'Designing efficient database schemas', 'Technical', 'Intermediate'),

-- Technical Skills - DevOps
('Git', 'Version control system', 'Technical', 'Beginner'),
('Docker', 'Containerization platform', 'Technical', 'Intermediate'),
('CI/CD', 'Continuous Integration and Continuous Deployment', 'Technical', 'Intermediate'),
('AWS', 'Amazon Web Services cloud platform', 'Technical', 'Intermediate'),

-- Soft Skills
('Communication', 'Effective verbal and written communication', 'Soft Skills', 'Beginner'),
('Teamwork', 'Collaborating effectively with team members', 'Soft Skills', 'Beginner'),
('Leadership', 'Ability to guide and inspire others', 'Soft Skills', 'Advanced'),
('Problem Solving', 'Analyzing and solving complex problems', 'Soft Skills', 'Beginner'),
('Time Management', 'Efficiently managing time and priorities', 'Soft Skills', 'Beginner'),
('Adaptability', 'Adjusting to new situations and challenges', 'Soft Skills', 'Beginner'),
('Critical Thinking', 'Objective analysis and evaluation', 'Soft Skills', 'Intermediate'),
('Project Management', 'Planning and executing projects', 'Soft Skills', 'Intermediate'),

-- Data Skills
('Data Analysis', 'Analyzing data to extract insights', 'Technical', 'Intermediate'),
('SQL', 'Structured Query Language for databases', 'Technical', 'Beginner'),
('Excel', 'Spreadsheet software for data manipulation', 'Technical', 'Beginner'),

-- Design Skills
('UI/UX Design', 'User interface and user experience design', 'Design', 'Intermediate'),
('Figma', 'Collaborative design tool', 'Design', 'Intermediate'),
('Adobe Photoshop', 'Image editing software', 'Design', 'Intermediate');

