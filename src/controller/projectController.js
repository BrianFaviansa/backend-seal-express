const asyncHandler = require("../middlewares/asyncHandler");
const prisma = require("../db");

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { tasks: true },
  });
  return res.status(200).json({
    message: "Projects retrieved successfully",
    data: projects,
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const project = await prisma.project.findUnique({
    where: {
      id: parseInt(id),
    },
    include: { tasks: true },
  });

  if (project) {
    return res.status(200).json({
      message: "Project retrieved successfully",
      data: project,
    });
  } else {
    return res.status(404).json({
      message: "Project not found",
    });
  }
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;

  if (!name || !description || !status) {
    throw new Error("Please provide the project name, description, and status");
  }

  if (
    status !== "Not Started" &&
    status !== "In Progress" &&
    status !== "Completed"
  ) {
    throw new Error(
      "Invalid status. Status must be one of 'Not Started', 'In Progress', or 'Completed'"
    );
  }

  const newProject = await prisma.project.create({
    data: {
      name,
      description,
      status,
    },
  });

  return res.status(201).json({
    message: "Project created successfully",
    data: newProject,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, description, status } = req.body;

  const project = await prisma.project.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (!name || !description) {
    throw new Error("Please provide the project name and description");
  }

  if (
    status !== "Not Started" &&
    status !== "In Progress" &&
    status !== "Completed"
  ) {
    throw new Error(
      "Invalid status. Status must be one of 'Not Started', 'In Progress', or 'Completed'"
    );
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      description,
      status,
    },
  });

  return res.status(200).json({
    message: "Project updated successfully",
    data: updatedProject,
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const project = await prisma.project.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.status(200).json({
    message: "Project deleted successfully",
  });
});

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
