const asyncHandler = require("../middlewares/asyncHandler");
const prisma = require("../db");

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany();

  return res.status(200).json({
    message: "Tasks retrieved successfully",
    data: tasks,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!task) {
    throw new Error(`Task not found`);
  }

  return res.status(200).json({
    message: "Task retrieved successfully",
    data: task,
  });
});

const createTask = asyncHandler(async (req, res) => {
  const { name, description, status, projectId, userId } = req.body;

  if (!name || !description || !projectId || !userId) {
    throw new Error(
      "Please provide the task name, description, project ID, and user ID"
    );
  }

  const newTask = await prisma.task.create({
    data: {
      name,
      description,
      status,
      projectId: parseInt(projectId),
      userId,
    },
  });

  return res.status(201).json({
    message: "Task created successfully",
    data: newTask,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, description, status, projectId, userId } = req.body;

  const task = await prisma.task.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (!name || !description || !projectId || !userId) {
    throw new Error(
      "Please provide the task name, description, and project ID"
    );
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      description,
      status,
      projectId: parseInt(projectId),
      userId,
    },
  });

  return res.status(200).json({
    message: "Task updated successfully",
    data: updatedTask,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const task = await prisma.task.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.status(200).json({
    message: "Task deleted successfully",
  });
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
