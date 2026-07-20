import { Router, Response } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, priority, createdAt]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, category, search, sortBy } = req.query;
    const taskRepo = AppDataSource.getRepository(Task);

    let query = taskRepo
      .createQueryBuilder("task")
      .where("task.userId = :userId", { userId: req.userId });

    if (status === "active") {
      query = query.andWhere("task.completed = :completed", { completed: false });
    } else if (status === "completed") {
      query = query.andWhere("task.completed = :completed", { completed: true });
    }

    if (priority && typeof priority === "string") {
      query = query.andWhere("task.priority = :priority", { priority });
    }

    if (category && typeof category === "string") {
      query = query.andWhere("task.category = :category", { category });
    }

    if (search && typeof search === "string") {
      query = query.andWhere(
        "(task.title ILIKE :search OR task.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (sortBy === "dueDate") {
      query = query.orderBy("task.dueDate", "ASC", "NULLS LAST");
    } else if (sortBy === "priority") {
      query = query.orderBy(
        "CASE task.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END",
        "ASC"
      );
    } else {
      query = query.orderBy("task.createdAt", "DESC");
    }

    const tasks = await query.getMany();
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch tasks" });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               category:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = taskRepo.create({
      userId: req.userId,
      title,
      description: description || null,
      priority: priority || "medium",
      category: category || "general",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const saved = await taskRepo.save(task);
    res.status(201).json({ task: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const { title, description, priority, category, dueDate, completed } =
      req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) task.completed = completed;

    const saved = await taskRepo.save(task);
    res.json({ task: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await taskRepo.remove(task);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Toggle task completion
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task completion toggled
 */
router.patch("/:id/complete", async (req: AuthRequest, res: Response) => {
  try {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    task.completed = !task.completed;
    const saved = await taskRepo.save(task);
    res.json({ task: saved });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "Failed to toggle completion" });
  }
});

export default router;
