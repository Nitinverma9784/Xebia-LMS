import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create Demo Teacher
  const teacherPassword = await bcrypt.hash('password123', 12);
  const teacher = await prisma.teacher.upsert({
    where: { email: 'teacher@xebia.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Connor',
      email: 'teacher@xebia.com',
      password: teacherPassword,
      subject: 'Computer Science',
    },
  });
  console.log('✅ Teacher created:', teacher.email);

  // Create Demo Student
  const studentPassword = await bcrypt.hash('password123', 12);
  const student = await prisma.student.upsert({
    where: { email: 'student@xebia.com' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'student@xebia.com',
      enrollmentNumber: 'ENR2026001',
      password: studentPassword,
    },
  });
  console.log('✅ Student created:', student.email);

  // Create Sample Assignment
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const existingAssignment = await prisma.assignment.findFirst({
    where: { title: 'Chapter 1: React Fundamentals & Hooks', teacherId: teacher.id },
  });

  if (!existingAssignment) {
    const assignment = await prisma.assignment.create({
      data: {
        title: 'Chapter 1: React Fundamentals & Hooks',
        subject: 'Computer Science',
        description: 'Complete the exercises on React state management, hooks, and context API. Submit your source code as a ZIP archive.',
        instructions: '1. Create a React component using useState and useEffect.\n2. Ensure proper TypeScript types.\n3. Include a README file with instructions.',
        dueDate,
        maxMarks: 100,
        status: 'published',
        teacherId: teacher.id,
      },
    });
    console.log('✅ Assignment created:', assignment.title);
  }

  console.log('🎉 Seeding complete!');
  console.log('----------------------------------------------------');
  console.log('TEACHER DEMO CREDENTIALS:');
  console.log('  Email: teacher@xebia.com');
  console.log('  Password: password123');
  console.log('----------------------------------------------------');
  console.log('STUDENT DEMO CREDENTIALS:');
  console.log('  Email: student@xebia.com');
  console.log('  Password: password123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
