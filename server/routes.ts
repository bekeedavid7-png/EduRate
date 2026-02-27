import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import { courses } from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send({ message: "Username already exists" });
      }

      const input = api.auth.register.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passport = require("passport");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err: any) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get(api.courses.list.path, async (req, res) => {
    const allCourses = await storage.getCourses();
    res.json(allCourses);
  });

  app.get(api.lecturers.list.path, async (req, res) => {
    const allLecturers = await storage.getLecturers();
    res.json(allLecturers);
  });

  app.get(api.evaluations.list.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'student') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const evals = await storage.getEvaluationsByStudent(req.user.id);
    res.json(evals);
  });

  app.post(api.evaluations.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'student') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const input = api.evaluations.create.input.parse(req.body);
      const evalData = await storage.createEvaluation({
        ...input,
        studentId: req.user.id,
      });
      res.status(201).json(evalData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.dashboard.lecturerSummary.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'lecturer') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const summary = await storage.getLecturerSummary(req.user.id);
    
    // Attach course info if they have one
    let courseInfo = undefined;
    if (req.user.courseId) {
      courseInfo = await storage.getCourse(req.user.courseId);
    }

    res.json({
      ...summary,
      course: courseInfo
    });
  });

  // Seed the DB if empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCourses = await storage.getCourses();
  if (existingCourses.length === 0) {
    await db.insert(courses).values([
      { department: 'Computer Science', code: 'CS101', name: 'Intro to Computer Science' },
      { department: 'Computer Science', code: 'CS201', name: 'Data Structures' },
      { department: 'Mathematics', code: 'MATH101', name: 'Calculus I' },
      { department: 'Mathematics', code: 'MATH201', name: 'Linear Algebra' },
      { department: 'Physics', code: 'PHYS101', name: 'Physics I' },
    ]);
  }
}