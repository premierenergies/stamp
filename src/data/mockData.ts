import { Customer, Project, Task } from "@/types/project";

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Technology",
    projects: [],
    totalBudget: 250000,
    activeProjects: 3,
    completedProjects: 2,
  },
  {
    id: "2",
    name: "Global Finance Inc",
    industry: "Finance",
    projects: [],
    totalBudget: 180000,
    activeProjects: 2,
    completedProjects: 1,
  },
  {
    id: "3",
    name: "HealthCare Plus",
    industry: "Healthcare",
    projects: [],
    totalBudget: 320000,
    activeProjects: 4,
    completedProjects: 3,
  },
  {
    id: "4",
    name: "EcoSmart Systems",
    industry: "Environmental",
    projects: [],
    totalBudget: 150000,
    activeProjects: 2,
    completedProjects: 1,
  },
  {
    id: "5",
    name: "Digital Media Pro",
    industry: "Media",
    projects: [],
    totalBudget: 200000,
    activeProjects: 3,
    completedProjects: 2,
  },
  {
    id: "6",
    name: "Construction Expert",
    industry: "Construction",
    projects: [],
    totalBudget: 450000,
    activeProjects: 5,
    completedProjects: 3,
  },
  {
    id: "7",
    name: "Retail Solutions",
    industry: "Retail",
    projects: [],
    totalBudget: 280000,
    activeProjects: 4,
    completedProjects: 2,
  },
  {
    id: "8",
    name: "Education First",
    industry: "Education",
    projects: [],
    totalBudget: 150000,
    activeProjects: 2,
    completedProjects: 1,
  },
  {
    id: "9",
    name: "Travel & Tours",
    industry: "Travel",
    projects: [],
    totalBudget: 190000,
    activeProjects: 3,
    completedProjects: 2,
  },
  {
    id: "10",
    name: "Manufacturing Pro",
    industry: "Manufacturing",
    projects: [],
    totalBudget: 380000,
    activeProjects: 4,
    completedProjects: 3,
  },
];

export const mockProjects: Project[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "TechCorp Solutions",
    name: "Website Redesign",
    description: "Complete website overhaul with modern design",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    budget: 50000,
    priority: "high",
    progress: 65,
    tasks: {
      total: 12,
      completed: 8,
      pending: 2,
      stuck: 2
    },
    inlineInspection: true,
    technicalSpecsDoc: "/docs/tech-specs-1.pdf",
    qapCriteria: true,
    qapDocument: "/docs/qap-1.pdf",
    tenderDocument: "/docs/tender-1.pdf",
    productType: "PERCE",
    plant: "PEPPL",
    otherDocuments: ["/docs/other-1.pdf", "/docs/other-2.pdf"],
    uploadedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    customerId: "1",
    customerName: "TechCorp Solutions",
    name: "Mobile App Development",
    description: "Native mobile application for customer engagement",
    status: "active",
    startDate: "2024-02-15",
    endDate: "2024-08-15",
    budget: 75000,
    priority: "high",
    progress: 35,
    tasks: {
      total: 15,
      completed: 5,
      pending: 8,
      stuck: 2
    },
    inlineInspection: true,
    technicalSpecsDoc: "/docs/tech-specs-2.pdf",
    qapCriteria: true,
    qapDocument: "/docs/qap-2.pdf",
    tenderDocument: "/docs/tender-2.pdf",
    productType: "TOPCON M10",
    plant: "PEPPL",
    otherDocuments: ["/docs/other-3.pdf"],
    uploadedAt: "2024-02-15T00:00:00Z"
  },
  {
    id: "3",
    customerId: "2",
    customerName: "Global Finance Inc",
    name: "Financial Dashboard",
    description: "Real-time financial analytics dashboard",
    status: "on-hold",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    budget: 90000,
    priority: "medium",
    progress: 15,
    tasks: {
      total: 20,
      completed: 3,
      pending: 15,
      stuck: 2
    },
    inlineInspection: false,
    technicalSpecsDoc: "/docs/tech-specs-3.pdf",
    qapCriteria: true,
    qapDocument: "/docs/qap-3.pdf",
    tenderDocument: "/docs/tender-3.pdf",
    productType: "TOPCON G12R",
    plant: "PEIPL",
    otherDocuments: [],
    uploadedAt: "2024-03-01T00:00:00Z"
  }
];

export const mockTasks: Task[] = [
  {
    id: "1",
    projectId: "1",
    title: "Design Homepage",
    description: "Create modern homepage design with responsive layouts",
    status: "in-progress",
    assignedUsers: ["s", "c"],
    dueDate: "2024-03-15",
    comments: [],
    created: "2024-01-15",
    priority: "high",
    timeSpent: 24,
    completedSubtasks: 3,
    totalSubtasks: 5,
    projectDetails: {
      customerName: "TechCorp Solutions",
      projectTitle: "Website Redesign",
      projectDescription: "Complete website overhaul with modern design",
      deliveryDateRange: {
        start: "2024-01-01",
        end: "2024-06-30"
      },
      inlineInspection: true,
      technicalSpecsDoc: "/docs/tech-specs-1.pdf",
      qapCriteria: true,
      qapDocument: "/docs/qap-1.pdf",
      tenderDocument: "/docs/tender-1.pdf",
      productType: "PERCE",
      plant: "PEPPL",
      otherDocuments: ["/docs/other-1.pdf", "/docs/other-2.pdf"],
      uploadedAt: "2024-01-01T00:00:00Z"
    },
    attachments: ["/attachments/design-1.pdf"]
  },
  {
    id: "2",
    projectId: "2",
    title: "UI/UX Design for Mobile App",
    description: "Design user interface and experience for the mobile application",
    status: "pending",
    assignedUsers: ["s"],
    dueDate: "2024-04-01",
    comments: [],
    created: "2024-02-15",
    priority: "high",
    timeSpent: 0,
    completedSubtasks: 0,
    totalSubtasks: 8,
    projectDetails: {
      customerName: "TechCorp Solutions",
      projectTitle: "Mobile App Development",
      projectDescription: "Native mobile application for customer engagement",
      deliveryDateRange: {
        start: "2024-02-15",
        end: "2024-08-15"
      },
      inlineInspection: true,
      technicalSpecsDoc: "/docs/tech-specs-2.pdf",
      qapCriteria: true,
      qapDocument: "/docs/qap-2.pdf",
      tenderDocument: "/docs/tender-2.pdf",
      productType: "TOPCON M10",
      plant: "PEPPL",
      otherDocuments: ["/docs/other-3.pdf"],
      uploadedAt: "2024-02-15T00:00:00Z"
    }
  }
];

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
