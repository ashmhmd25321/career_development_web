-- Seed Learning Resources and Certifications

-- Learning Resources
INSERT IGNORE INTO learning_resources (title, description, resource_type, url, difficulty_level, duration_minutes, free, is_approved) VALUES
-- React Resources
('React Documentation', 'Official React documentation and guides', 'Documentation', 'https://react.dev', 'Beginner', NULL, TRUE, TRUE),
('Complete React Course - FreeCodeCamp', 'Comprehensive React course with hands-on projects', 'Course', 'https://www.freecodecamp.org/learn/front-end-development-libraries/', 'Intermediate', 300, TRUE, TRUE),
('React Tutorial - YouTube', 'React tutorial series for beginners', 'Video', 'https://www.youtube.com/watch?v=u6aESuemK0Y', 'Beginner', 45, TRUE, TRUE),
('Build a React App - Medium Article', 'Step-by-step guide to building your first React app', 'Article', 'https://medium.com/', 'Beginner', 15, TRUE, TRUE),

-- JavaScript Resources
('JavaScript MDN Docs', 'Complete JavaScript reference documentation', 'Documentation', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'Beginner', NULL, TRUE, TRUE),
('JavaScript: The Definitive Guide - Book', 'Comprehensive JavaScript book covering all aspects', 'Book', 'https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/', 'Intermediate', 1200, FALSE, TRUE),
('JavaScript Tutorial - W3Schools', 'Interactive JavaScript tutorial', 'Tutorial', 'https://www.w3schools.com/js/', 'Beginner', 180, TRUE, TRUE),

-- TypeScript Resources
('TypeScript Handbook', 'Official TypeScript documentation', 'Documentation', 'https://www.typescriptlang.org/docs/', 'Intermediate', NULL, TRUE, TRUE),
('TypeScript for Beginners - Udemy', 'Learn TypeScript from scratch', 'Course', 'https://www.udemy.com', 'Beginner', 480, FALSE, TRUE),

-- Node.js Resources
('Node.js Documentation', 'Official Node.js documentation', 'Documentation', 'https://nodejs.org/docs', 'Beginner', NULL, TRUE, TRUE),
('Node.js Webinar - Advanced Topics', 'Advanced Node.js concepts and best practices', 'Webinar', 'https://nodejs.org', 'Advanced', 60, TRUE, TRUE),

-- SQL/Database Resources
('SQL Tutorial - Khan Academy', 'Learn SQL fundamentals', 'Course', 'https://www.khanacademy.org', 'Beginner', 240, TRUE, TRUE),
('MySQL Tutorial', 'Complete MySQL tutorial', 'Tutorial', 'https://www.mysqltutorial.org', 'Beginner', 180, TRUE, TRUE),

-- Git Resources
('Git Documentation', 'Official Git documentation', 'Documentation', 'https://git-scm.com/doc', 'Beginner', NULL, TRUE, TRUE),
('Git Tutorial', 'Learn Git version control', 'Tutorial', 'https://www.atlassian.com/git/tutorials', 'Beginner', 120, TRUE, TRUE);

-- Certifications
INSERT IGNORE INTO certifications (title, description, issuing_organization, difficulty_level, validity_period_months, cost, exam_required) VALUES
-- React Certifications
('React Developer Certification', 'Professional certification for React development', 'React Institute', 'Intermediate', 24, 299.00, TRUE),
('React Advanced Certification', 'Advanced React developer certification', 'React Institute', 'Advanced', 24, 399.00, TRUE),

-- JavaScript Certifications
('JavaScript Professional Certification', 'Certified JavaScript Developer', 'JavaScript Council', 'Intermediate', 36, 249.00, TRUE),
('Advanced JavaScript Certification', 'Expert-level JavaScript certification', 'JavaScript Council', 'Advanced', 36, 349.00, TRUE),

-- AWS Certifications
('AWS Certified Solutions Architect', 'Amazon Web Services certification', 'AWS', 'Advanced', 36, 150.00, TRUE),
('AWS Certified Developer', 'AWS developer certification', 'AWS', 'Intermediate', 36, 150.00, TRUE),

-- Database Certifications
('MySQL Certification', 'MySQL database administration certification', 'Oracle', 'Intermediate', 36, 245.00, TRUE),
('PostgreSQL Administrator Certification', 'PostgreSQL admin certification', 'PostgreSQL Global Development Group', 'Advanced', 36, 195.00, TRUE);

