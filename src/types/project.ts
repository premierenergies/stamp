
export type ProjectStatus = "active" | "completed" | "on-hold";
export type TaskStatus = "pending" | "in-progress" | "completed" | "stuck" | "approved";
export type Priority = "low" | "medium" | "high";
export type Plant = "PEPPL" | "PEIPL" | "PEGEPL 1" | "PEGEPL 2";
export type ProductType = "PERCE" | "TOPCON M10" | "TOPCON G12R";

export interface Project {
  id: string;
  customerId: string;
  customerName: string;
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
  // New fields
  inlineInspection: boolean;
  technicalSpecsDoc: string;
  qapCriteria: boolean;
  qapDocument?: string;
  tenderDocument: string;
  productType: ProductType;
  plant: Plant;
  otherDocuments?: string[];
  uploadedAt: string;
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
  // New fields
  projectDetails: {
    customerName: string;
    projectTitle: string;
    projectDescription: string;
    deliveryDateRange: {
      start: string;
      end: string;
    };
    inlineInspection: boolean;
    technicalSpecsDoc: string;
    qapCriteria: boolean;
    qapDocument?: string;
    tenderDocument: string;
    productType: ProductType;
    plant: Plant;
    otherDocuments?: string[];
    uploadedAt: string;
  };
  attachments?: string[];
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

