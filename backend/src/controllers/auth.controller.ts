import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const generateToken = (id: string, role: string, email: string) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── TEACHER AUTH ────────────────────────────────────────────────────────────

export const teacherRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password, subject } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const teacher = await prisma.teacher.create({
      data: { name, email, password: hashed, subject },
    });

    const token = generateToken(teacher.id, 'teacher', teacher.email);

    res.status(201).json({
      token,
      user: { id: teacher.id, name: teacher.name, email: teacher.email, role: 'teacher', subject: teacher.subject },
    });
  } catch (error) {
    console.error('Teacher register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const teacherLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(teacher.id, 'teacher', teacher.email);

    res.json({
      token,
      user: { id: teacher.id, name: teacher.name, email: teacher.email, role: 'teacher', subject: teacher.subject },
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── STUDENT AUTH ────────────────────────────────────────────────────────────

export const studentRegister = async (req: Request, res: Response) => {
  try {
    const { name, enrollmentNumber, email, password } = req.body;

    if (!name || !enrollmentNumber || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingEmail = await prisma.student.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const existingEnroll = await prisma.student.findUnique({ where: { enrollmentNumber } });
    if (existingEnroll) {
      return res.status(409).json({ message: 'Enrollment number already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const student = await prisma.student.create({
      data: { name, enrollmentNumber, email, password: hashed },
    });

    const token = generateToken(student.id, 'student', student.email);

    res.status(201).json({
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('Student register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(student.id, 'student', student.email);

    res.json({
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ME ──────────────────────────────────────────────────────────────────

export const getMe = async (req: any, res: Response) => {
  try {
    const { id, role } = req.user;

    if (role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, subject: true, role: true, avatar: true, createdAt: true },
      });
      return res.json({ user: { ...teacher, role: 'teacher' } });
    }

    if (role === 'student') {
      const student = await prisma.student.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, enrollmentNumber: true, role: true, avatar: true, createdAt: true },
      });
      return res.json({ user: { ...student, role: 'student' } });
    }

    res.status(400).json({ message: 'Invalid role.' });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
