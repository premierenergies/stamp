
export type ProjectStatus = "active" | "completed" | "on-hold";
export type TaskStatus = "pending" | "in-progress" | "completed" | "stuck" | "approved";
export type Priority = "low" | "medium" | "high";

export interface Project {
  id: string;
  customerId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  priority: Priority;
  progress: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    stuck: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedUsers: string[];
  dueDate: string;
  comments: Comment[];
  created: string;
  priority: Priority;
  timeSpent: number;
  completedSubtasks: number;
  totalSubtasks: number;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  projects: Project[];
  totalBudget: number;
  activeProjects: number;
  completedProjects: number;
}
