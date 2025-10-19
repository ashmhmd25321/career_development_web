import { connectDatabase, getConnection } from './connection';
import { logger } from '@/utils/logger';
import bcrypt from 'bcryptjs';

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDatabase();
    const connection = getConnection();
    
    logger.info('🌱 Starting database seeding...');
    
    // Check if data already exists
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    const userCount = (existingUsers as any)[0].count;
    
    if (userCount > 0) {
      logger.info('⚠️  Database already has data, skipping seeding');
      return;
    }
    
    // Hash password for default users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Insert default admin user
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin@careerdev.com', hashedPassword, 'System', 'Administrator', 'admin', true, true]
    );
    
    // Insert default employer user
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['employer@techcorp.com', hashedPassword, 'John', 'Employer', 'employer', true, true]
    );
    
    // Insert default student user
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['student@university.edu', hashedPassword, 'Jane', 'Student', 'student', true, true]
    );
    
    // Get user IDs for profile creation
    const [adminResult] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@careerdev.com']);
    const [employerResult] = await connection.query('SELECT id FROM users WHERE email = ?', ['employer@techcorp.com']);
    const [studentResult] = await connection.query('SELECT id FROM users WHERE email = ?', ['student@university.edu']);
    
    const adminId = (adminResult as any)[0].id;
    const employerId = (employerResult as any)[0].id;
    const studentId = (studentResult as any)[0].id;
    
    // Create employer profile
    await connection.query(
      `INSERT INTO employer_profiles (user_id, company_name, company_size, industry, website_url, company_description, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        'TechCorp Solutions',
        '51-200',
        'Technology',
        'https://techcorp.com',
        'Leading technology company specializing in innovative software solutions.',
        true
      ]
    );
    
    // Create student profile
    await connection.query(
      `INSERT INTO student_profiles (user_id, student_id, university, major, graduation_date, bio, career_objectives) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        'STU2024001',
        'University of Technology',
        'Computer Science',
        '2025-06-15',
        'Passionate computer science student with a focus on full-stack development.',
        'Seeking internship opportunities to gain hands-on experience in software development and contribute to innovative projects.'
      ]
    );
    
    // Create sample jobs
    const [techCategory] = await connection.query('SELECT id FROM job_categories WHERE name = ?', ['Technology']);
    const categoryId = (techCategory as any)[0].id;
    
    await connection.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, job_type, location_type, location, 
                        experience_level, category_id, application_deadline, start_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        'Frontend Developer Intern',
        'Join our team as a Frontend Developer Intern and work on cutting-edge web applications using React and modern JavaScript.',
        'Experience with React, JavaScript, HTML, CSS. Familiarity with Git version control.',
        'internship',
        'hybrid',
        'San Francisco, CA',
        'entry',
        categoryId,
        '2024-12-31',
        '2025-01-15'
      ]
    );
    
    await connection.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, job_type, location_type, location, 
                        experience_level, category_id, application_deadline, start_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        'Full Stack Developer',
        'We are looking for a Full Stack Developer to join our growing team and work on exciting projects.',
        'Experience with Node.js, React, MySQL. 2+ years of professional development experience.',
        'full-time',
        'remote',
        'Remote',
        'mid',
        categoryId,
        '2024-12-15',
        '2025-01-01'
      ]
    );
    
    // Create sample events
    await connection.query(
      `INSERT INTO events (title, description, event_type, organizer_id, start_date, end_date, 
                          location, location_type, max_attendees, is_free) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Career Development Workshop',
        'Learn essential skills for career advancement and job search strategies.',
        'workshop',
        adminId,
        '2025-01-20 10:00:00',
        '2025-01-20 16:00:00',
        'University Campus',
        'in-person',
        50,
        true
      ]
    );
    
    await connection.query(
      `INSERT INTO events (title, description, event_type, organizer_id, start_date, end_date, 
                          location, location_type, max_attendees, is_free) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Tech Industry Networking Event',
        'Connect with industry professionals and learn about career opportunities.',
        'networking',
        adminId,
        '2025-01-25 18:00:00',
        '2025-01-25 21:00:00',
        'Virtual Event',
        'online',
        100,
        true
      ]
    );
    
    logger.info('🎉 Database seeding completed successfully!');
    logger.info('📧 Default users created:');
    logger.info('   Admin: admin@careerdev.com / password123');
    logger.info('   Employer: employer@techcorp.com / password123');
    logger.info('   Student: student@university.edu / password123');
    
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
