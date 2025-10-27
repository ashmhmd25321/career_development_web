import { getConnection } from '@/database/connection';

const skills = [
  // Technical Skills - Frontend
  { name: 'React', description: 'JavaScript library for building user interfaces', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'TypeScript', description: 'Typed superset of JavaScript', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'JavaScript', description: 'Programming language for web development', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'HTML5', description: 'Markup language for structuring web pages', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'CSS3', description: 'Styling language for web pages', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS framework', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'Vue.js', description: 'Progressive JavaScript framework', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'Angular', description: 'TypeScript-based web application framework', category: 'Technical', difficultyLevel: 'Advanced' },
  
  // Technical Skills - Backend
  { name: 'Node.js', description: 'JavaScript runtime for server-side development', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'Express.js', description: 'Web application framework for Node.js', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'Python', description: 'High-level programming language', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'Java', description: 'Object-oriented programming language', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'C#', description: 'Object-oriented programming language by Microsoft', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'RESTful API', description: 'Architecture for web services', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'GraphQL', description: 'Query language for APIs', category: 'Technical', difficultyLevel: 'Advanced' },
  { name: 'Microservices', description: 'Architectural approach to software development', category: 'Technical', difficultyLevel: 'Advanced' },
  
  // Technical Skills - Database
  { name: 'MySQL', description: 'Relational database management system', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'PostgreSQL', description: 'Advanced open-source relational database', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'MongoDB', description: 'NoSQL document database', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'Database Design', description: 'Designing efficient database schemas', category: 'Technical', difficultyLevel: 'Intermediate' },
  
  // Technical Skills - DevOps
  { name: 'Git', description: 'Version control system', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'Docker', description: 'Containerization platform', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'CI/CD', description: 'Continuous Integration and Continuous Deployment', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'AWS', description: 'Amazon Web Services cloud platform', category: 'Technical', difficultyLevel: 'Intermediate' },
  
  // Soft Skills
  { name: 'Communication', description: 'Effective verbal and written communication', category: 'Soft Skills', difficultyLevel: 'Beginner' },
  { name: 'Teamwork', description: 'Collaborating effectively with team members', category: 'Soft Skills', difficultyLevel: 'Beginner' },
  { name: 'Leadership', description: 'Ability to guide and inspire others', category: 'Soft Skills', difficultyLevel: 'Advanced' },
  { name: 'Problem Solving', description: 'Analyzing and solving complex problems', category: 'Soft Skills', difficultyLevel: 'Beginner' },
  { name: 'Time Management', description: 'Efficiently managing time and priorities', category: 'Soft Skills', difficultyLevel: 'Beginner' },
  { name: 'Adaptability', description: 'Adjusting to new situations and challenges', category: 'Soft Skills', difficultyLevel: 'Beginner' },
  { name: 'Critical Thinking', description: 'Objective analysis and evaluation', category: 'Soft Skills', difficultyLevel: 'Intermediate' },
  { name: 'Project Management', description: 'Planning and executing projects', category: 'Soft Skills', difficultyLevel: 'Intermediate' },
  
  // Data Skills
  { name: 'Data Analysis', description: 'Analyzing data to extract insights', category: 'Technical', difficultyLevel: 'Intermediate' },
  { name: 'SQL', description: 'Structured Query Language for databases', category: 'Technical', difficultyLevel: 'Beginner' },
  { name: 'Excel', description: 'Spreadsheet software for data manipulation', category: 'Technical', difficultyLevel: 'Beginner' },
  
  // Design Skills
  { name: 'UI/UX Design', description: 'User interface and user experience design', category: 'Design', difficultyLevel: 'Intermediate' },
  { name: 'Figma', description: 'Collaborative design tool', category: 'Design', difficultyLevel: 'Intermediate' },
  { name: 'Adobe Photoshop', description: 'Image editing software', category: 'Design', difficultyLevel: 'Intermediate' },
];

export const seedSkills = async () => {
  try {
    const connection = getConnection();
    
    // Check if skills already exist
    const [existing] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM skills');
    
    if (existing[0].count > 0) {
      console.log('Skills already seeded');
      return;
    }
    
    // Insert skills
    for (const skill of skills) {
      await connection.execute(
        'INSERT INTO skills (name, description, category, difficulty_level) VALUES (?, ?, ?, ?)',
        [skill.name, skill.description, skill.category, skill.difficultyLevel]
      );
    }
    
    console.log(`✅ Seeded ${skills.length} skills`);
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
};

