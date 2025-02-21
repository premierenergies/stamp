
export type ProjectStatus = "active" | "completed" | "on-hold";
export type TaskStatus = "pending" | "in-progress" | "completed" | "stuck" | "approved";

export interface Project {
  id: string;
  customerId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  priority: "low" | "medium" | "high";
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
}
