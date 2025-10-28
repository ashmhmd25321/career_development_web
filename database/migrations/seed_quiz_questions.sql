-- Sample Quiz Questions for Certifications

-- Get the certification IDs first
SET @react_basic_id = (SELECT id FROM certifications WHERE title = 'React Developer Certification' LIMIT 1);
SET @react_advanced_id = (SELECT id FROM certifications WHERE title = 'React Advanced Certification' LIMIT 1);
SET @js_prof_id = (SELECT id FROM certifications WHERE title = 'JavaScript Professional Certification' LIMIT 1);

-- React Developer Certification Questions
INSERT INTO quiz_questions (certification_id, question_text, question_type, points, order_index) VALUES
(@react_basic_id, 'What is JSX?', 'multiple_choice', 2, 1),
(@react_basic_id, 'What is the purpose of React hooks?', 'multiple_choice', 2, 2),
(@react_basic_id, 'Which lifecycle method is equivalent to useEffect?', 'multiple_choice', 2, 3),
(@react_basic_id, 'How do you pass data from parent to child component?', 'multiple_choice', 2, 4),
(@react_basic_id, 'What is the virtual DOM?', 'multiple_choice', 2, 5);

-- Get question IDs for answers
SET @q1_id = (SELECT id FROM quiz_questions WHERE certification_id = @react_basic_id AND order_index = 1);
SET @q2_id = (SELECT id FROM quiz_questions WHERE certification_id = @react_basic_id AND order_index = 2);
SET @q3_id = (SELECT id FROM quiz_questions WHERE certification_id = @react_basic_id AND order_index = 3);
SET @q4_id = (SELECT id FROM quiz_questions WHERE certification_id = @react_basic_id AND order_index = 4);
SET @q5_id = (SELECT id FROM quiz_questions WHERE certification_id = @react_basic_id AND order_index = 5);

-- Answers for Q1
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q1_id, 'JavaScript syntax extension', TRUE, 1),
(@q1_id, 'A JavaScript library', FALSE, 2),
(@q1_id, 'A CSS preprocessor', FALSE, 3),
(@q1_id, 'A database query language', FALSE, 4);

-- Answers for Q2
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q2_id, 'To manage state and lifecycle', TRUE, 1),
(@q2_id, 'To style components', FALSE, 2),
(@q2_id, 'To handle routing', FALSE, 3),
(@q2_id, 'To create animations', FALSE, 4);

-- Answers for Q3
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q3_id, 'componentDidMount, componentDidUpdate, componentWillUnmount', TRUE, 1),
(@q3_id, 'render, componentDidMount', FALSE, 2),
(@q3_id, 'constructor, render', FALSE, 3),
(@q3_id, 'getDerivedStateFromProps', FALSE, 4);

-- Answers for Q4
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q4_id, 'Using props', TRUE, 1),
(@q4_id, 'Using state', FALSE, 2),
(@q4_id, 'Using refs', FALSE, 3),
(@q4_id, 'Using context', FALSE, 4);

-- Answers for Q5
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q5_id, 'A lightweight representation of the DOM in memory', TRUE, 1),
(@q5_id, 'A real DOM copy', FALSE, 2),
(@q5_id, 'A JavaScript framework', FALSE, 3),
(@q5_id, 'A CSS-in-JS library', FALSE, 4);

-- JavaScript Professional Certification Questions
INSERT INTO quiz_questions (certification_id, question_text, question_type, points, order_index) VALUES
(@js_prof_id, 'What is a closure in JavaScript?', 'multiple_choice', 3, 1),
(@js_prof_id, 'What is the event loop?', 'multiple_choice', 3, 2),
(@js_prof_id, 'What are arrow functions?', 'multiple_choice', 2, 3),
(@js_prof_id, 'How does prototypal inheritance work?', 'multiple_choice', 3, 4);

SET @q6_id = (SELECT id FROM quiz_questions WHERE certification_id = @js_prof_id AND order_index = 1);
SET @q7_id = (SELECT id FROM quiz_questions WHERE certification_id = @js_prof_id AND order_index = 2);
SET @q8_id = (SELECT id FROM quiz_questions WHERE certification_id = @js_prof_id AND order_index = 3);
SET @q9_id = (SELECT id FROM quiz_questions WHERE certification_id = @js_prof_id AND order_index = 4);

-- Answers for Q6
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q6_id, 'Function with access to outer scope', TRUE, 1),
(@q6_id, 'A data structure', FALSE, 2),
(@q6_id, 'A JavaScript class', FALSE, 3),
(@q6_id, 'A browser API', FALSE, 4);

-- Answers for Q7
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q7_id, 'Mechanism for handling asynchronous code', TRUE, 1),
(@q7_id, 'A loop in the code', FALSE, 2),
(@q7_id, 'A type of function', FALSE, 3),
(@q7_id, 'A database operation', FALSE, 4);

-- Answers for Q8
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q8_id, 'Functions with lexical this', TRUE, 1),
(@q8_id, 'Functions with dynamic this', FALSE, 2),
(@q8_id, 'Functions that cannot use this', FALSE, 3),
(@q8_id, 'Functions that are asynchronous', FALSE, 4);

-- Answers for Q9
INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES
(@q9_id, 'Objects inherit from prototypes', TRUE, 1),
(@q9_id, 'Objects have fixed methods', FALSE, 2),
(@q9_id, 'No inheritance in JavaScript', FALSE, 3),
(@q9_id, 'Only classes can inherit', FALSE, 4);

