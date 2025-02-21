
import { Customer, Project, Task } from "@/types/project";

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Technology",
    projects: [],
  },
  {
    id: "2",
    name: "Global Finance Inc",
    industry: "Finance",
    projects: [],
  },
  {
    id: "3",
    name: "HealthCare Plus",
    industry: "Healthcare",
    projects: [],
  },
  {
    id: "4",
    name: "EcoSmart Systems",
    industry: "Environmental",
    projects: [],
  },
  {
    id: "5",
    name: "Digital Media Pro",
    industry: "Media",
    projects: [],
  },
  {
    id: "6",
    name: "Construction Expert",
    industry: "Construction",
    projects: [],
  },
  {
    id: "7",
    name: "Retail Solutions",
    industry: "Retail",
    projects: [],
  },
  {
    id: "8",
    name: "Education First",
    industry: "Education",
    projects: [],
  },
  {
    id: "9",
    name: "Travel & Tours",
    industry: "Travel",
    projects: [],
  },
  {
    id: "10",
    name: "Manufacturing Pro",
    industry: "Manufacturing",
    projects: [],
  },
];

export const mockProjects: Project[] = [
  {
    id: "1",
    customerId: "1",
    name: "Website Redesign",
    description: "Complete website overhaul with modern design",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    budget: 50000,
    priority: "high",
  },
  // Add more mock projects...
];

export const mockTasks: Task[] = [
  {
    id: "1",
    projectId: "1",
    title: "Design Homepage",
    description: "Create modern homepage design",
    status: "in-progress",
    assignedUsers: ["c"],
    dueDate: "2024-03-15",
    comments: [],
    created: "2024-01-15",
  },
  // Add more mock tasks...
];

// Initialize local storage with mock data
export const initializeMockData = () => {
  if (!localStorage.getItem("customers")) {
    localStorage.setItem("customers", JSON.stringify(mockCustomers));
  }
  if (!localStorage.getItem("projects")) {
    localStorage.setItem("projects", JSON.stringify(mockProjects));
  }
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(mockTasks));
  }
};
