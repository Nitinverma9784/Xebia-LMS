import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

// ─── GET ALL PUBLISHED ASSIGNMENTS ──────────────────────────────────────────

export const getStudentAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { subject, status, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status: 'published' };
    if (subject) where.subject = { contains: subject as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true } },
          submissions: {
            where: { studentId },
            select: { id: true, status: true, marks: true, submittedAt: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Filter by submission status if provided
    let enriched = assignments.map((a) => ({
      ...a,
      submissionStatus: a.submissions.length > 0 ? a.submissions[0].status : 'not_submitted',
      submission: a.submissions[0] || null,
    }));

    if (status) {
      if (status === 'not_submitted') {
        enriched = enriched.filter((a) => a.submissionStatus === 'not_submitted');
      } else {
        enriched = enriched.filter((a) => a.submissionStatus === status);
      }
    }

    res.json({
      assignments: enriched,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SINGLE ASSIGNMENT DETAIL ────────────────────────────────────────────

export const getAssignmentDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.id;

    const assignment = await prisma.assignment.findFirst({
      where: { id, status: 'published' },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        submissions: {
          where: { studentId },
          select: {
            id: true,
            uploadedFile: true,
            fileName: true,
            submittedAt: true,
            marks: true,
            feedback: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.json({
      assignment: {
        ...assignment,
        submission: assignment.submissions[0] || null,
      },
    });
  } catch (error) {
    console.error('Get assignment detail error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── SUBMIT ASSIGNMENT ────────────────────────────────────────────────────────

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.body;
    const studentId = req.user!.id;
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ message: 'File is required.' });
    }

    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required.' });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, status: 'published' },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Check if due date has passed
    const now = new Date();
    if (now > assignment.dueDate) {
      return res.status(400).json({ message: 'Submission deadline has passed.' });
    }

    // Check for existing submission
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });

    let submission;
    if (existing) {
      // Replace submission
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          uploadedFile: file.path,
          fileName: file.originalname,
          submittedAt: new Date(),
          status: 'submitted',
          marks: null,
          feedback: null,
        },
        include: {
          student: { select: { id: true, name: true, enrollmentNumber: true } },
          assignment: { select: { id: true, title: true } },
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId,
          uploadedFile: file.path,
          fileName: file.originalname,
        },
        include: {
          student: { select: { id: true, name: true, enrollmentNumber: true } },
          assignment: { select: { id: true, title: true } },
        },
      });
    }

    res.status(existing ? 200 : 201).json({ submission });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MY SUBMISSIONS ───────────────────────────────────────────────────────

export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { teacher: { select: { id: true, name: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE STUDENT PROFILE ───────────────────────────────────────────────────

export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { name } = req.body;
    const file = req.file as any;

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(name && { name }),
        ...(file && { avatar: file.path }),
      },
      select: { id: true, name: true, email: true, enrollmentNumber: true, avatar: true, role: true },
    });

    res.json({ user: { ...updated, role: 'student' } });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET STUDENT DASHBOARD STATS ─────────────────────────────────────────────

export const getStudentDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const now = new Date();

    const [totalAssignments, submissions] = await Promise.all([
      prisma.assignment.count({ where: { status: 'published' } }),
      prisma.submission.findMany({
        where: { studentId },
        include: { assignment: true },
      }),
    ]);

    const submittedCount = submissions.length;
    const reviewedSubmissions = submissions.filter((s) => s.status === 'reviewed' && s.marks !== null);
    const reviewedCount = reviewedSubmissions.length;
    const pendingCount = Math.max(0, totalAssignments - submittedCount);

    let averagePercentage = 0;
    if (reviewedSubmissions.length > 0) {
      const totalPct = reviewedSubmissions.reduce((acc, s) => {
        const max = s.assignment.maxMarks || 100;
        return acc + ((s.marks || 0) / max) * 100;
      }, 0);
      averagePercentage = Math.round(totalPct / reviewedSubmissions.length);
    }

    res.json({
      stats: {
        totalAssignments,
        pendingAssignments: pendingCount,
        submittedAssignments: submittedCount,
        reviewedAssignments: reviewedCount,
        averageGrade: averagePercentage,
      },
    });
  } catch (error) {
    console.error('Student dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET LEARNING PROGRESS ────────────────────────────────────────────────────

export const getLearningProgress = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const [allAssignments, submissions] = await Promise.all([
      prisma.assignment.findMany({
        where: { status: 'published' },
        select: { id: true, subject: true, maxMarks: true, dueDate: true, title: true },
      }),
      prisma.submission.findMany({
        where: { studentId },
        include: { assignment: true },
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    // Group by subject
    const subjectStats: Record<string, { subject: string; total: number; submitted: number; reviewed: number; totalEarned: number; totalMax: number }> = {};

    allAssignments.forEach((a) => {
      if (!subjectStats[a.subject]) {
        subjectStats[a.subject] = { subject: a.subject, total: 0, submitted: 0, reviewed: 0, totalEarned: 0, totalMax: 0 };
      }
      subjectStats[a.subject].total += 1;
      subjectStats[a.subject].totalMax += a.maxMarks;
    });

    submissions.forEach((s) => {
      const subj = s.assignment.subject;
      if (!subjectStats[subj]) {
        subjectStats[subj] = { subject: subj, total: 0, submitted: 0, reviewed: 0, totalEarned: 0, totalMax: 0 };
      }
      subjectStats[subj].submitted += 1;
      if (s.status === 'reviewed' && s.marks !== null) {
        subjectStats[subj].reviewed += 1;
        subjectStats[subj].totalEarned += s.marks;
      }
    });

    const subjects = Object.values(subjectStats).map((s) => ({
      ...s,
      percentage: s.totalMax > 0 && s.reviewed > 0 ? Math.round((s.totalEarned / s.totalMax) * 100) : 0,
    }));

    res.json({
      progress: {
        totalPublished: allAssignments.length,
        totalSubmitted: submissions.length,
        totalReviewed: submissions.filter((s) => s.status === 'reviewed').length,
        subjects,
        recentSubmissions: submissions.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Learning progress error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
