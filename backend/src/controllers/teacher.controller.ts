import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

// ─── CREATE ASSIGNMENT ───────────────────────────────────────────────────────

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, description, instructions, dueDate, maxMarks, status } = req.body;
    const teacherId = req.user!.id;

    if (!title || !subject || !description || !dueDate || !maxMarks) {
      return res.status(400).json({ message: 'Title, subject, description, dueDate and maxMarks are required.' });
    }

    const file = req.file as any;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        subject,
        description,
        instructions: instructions || '',
        dueDate: new Date(dueDate),
        maxMarks: parseInt(maxMarks),
        attachment: file ? file.path : null,
        attachmentName: file ? file.originalname : null,
        status: status || 'draft',
        teacherId,
      },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ALL ASSIGNMENTS (Teacher's) ─────────────────────────────────────────

export const getTeacherAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const { status, subject, search, page = '1', limit = '10' } = req.query;

    const where: any = { teacherId };
    if (status) where.status = status;
    if (subject) where.subject = { contains: subject as string, mode: 'insensitive' };
    if (search) where.title = { contains: search as string, mode: 'insensitive' };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Get total students for each assignment
    const totalStudents = await prisma.student.count();

    const enriched = assignments.map((a) => ({
      ...a,
      submittedCount: a._count.submissions,
      pendingCount: totalStudents - a._count.submissions,
      totalStudents,
    }));

    res.json({
      assignments: enriched,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SINGLE ASSIGNMENT ───────────────────────────────────────────────────

export const getAssignmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE ASSIGNMENT ───────────────────────────────────────────────────────

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;
    const { title, subject, description, instructions, dueDate, maxMarks, status } = req.body;

    const existing = await prisma.assignment.findFirst({ where: { id, teacherId } });
    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const file = req.file as any;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subject && { subject }),
        ...(description && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxMarks && { maxMarks: parseInt(maxMarks) }),
        ...(status && { status }),
        ...(file && { attachment: file.path, attachmentName: file.originalname }),
      },
      include: { teacher: { select: { id: true, name: true } } },
    });

    res.json({ assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── DELETE ASSIGNMENT ───────────────────────────────────────────────────────

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    const existing = await prisma.assignment.findFirst({ where: { id, teacherId } });
    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    await prisma.assignment.delete({ where: { id } });

    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SUBMISSIONS FOR ASSIGNMENT ──────────────────────────────────────────

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user!.id;

    // Verify teacher owns assignment
    const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, teacherId } });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, name: true, email: true, enrollmentNumber: true } },
        assignment: { select: { id: true, title: true, maxMarks: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalStudents = await prisma.student.count();

    res.json({ submissions, totalStudents, assignment });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GRADE SUBMISSION ────────────────────────────────────────────────────────

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, marks, feedback } = req.body;
    const teacherId = req.user!.id;

    if (marks === undefined || marks === null) {
      return res.status(400).json({ message: 'Marks are required.' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.assignment.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to grade this submission.' });
    }

    if (marks > submission.assignment.maxMarks) {
      return res.status(400).json({ message: `Marks cannot exceed maximum marks (${submission.assignment.maxMarks}).` });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: { marks: parseInt(marks), feedback: feedback || '', status: 'reviewed' },
      include: {
        student: { select: { id: true, name: true, email: true, enrollmentNumber: true } },
        assignment: { select: { id: true, title: true, maxMarks: true } },
      },
    });

    res.json({ submission: updated });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── TEACHER DASHBOARD STATS ─────────────────────────────────────────────────

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const now = new Date();

    const [total, active, totalStudents, totalSubmissions, pendingSubmissions] = await Promise.all([
      prisma.assignment.count({ where: { teacherId } }),
      prisma.assignment.count({ where: { teacherId, status: 'published', dueDate: { gte: now } } }),
      prisma.student.count(),
      prisma.submission.count({
        where: { assignment: { teacherId } },
      }),
      prisma.submission.count({
        where: { assignment: { teacherId }, status: 'submitted' },
      }),
    ]);

    res.json({
      stats: {
        totalAssignments: total,
        activeAssignments: active,
        submittedAssignments: totalSubmissions,
        pendingAssignments: pendingSubmissions,
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE TEACHER PROFILE ──────────────────────────────────────────────────

export const updateTeacherProfile = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const { name, subject } = req.body;
    const file = req.file as any;

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(file && { avatar: file.path }),
      },
      select: { id: true, name: true, email: true, subject: true, avatar: true, role: true },
    });

    res.json({ user: { ...updated, role: 'teacher' } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
