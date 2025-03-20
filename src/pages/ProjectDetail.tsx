// ProjectDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Inline helper to convert file paths to absolute URLs using the current origin.
// This version encodes the URL so that spaces and special characters are handled correctly.
const getDocumentUrl = (docPath: string): string => {
  if (!docPath) return "";
  const origin = window.location.origin;
  if (docPath.startsWith("C:\\fakepath\\")) {
    const filename = docPath.split("\\").pop();
    return `${origin}/uploads/${encodeURIComponent(filename || "")}`;
  }
  if (docPath.startsWith("/uploads/")) {
    // encode the entire URL portion after the origin
    return `${origin}${encodeURI(docPath)}`;
  }
  if (docPath.startsWith("http")) {
    return docPath;
  }
  return docPath;
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  completedSubtasks: number;
  totalSubtasks: number;
  dueDate: string;
}

interface Project {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  priority: string;
  progress: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    stuck: number;
  };
  inlineInspection: boolean;
  technicalSpecsDoc: string;
  qapCriteria: boolean;
  qapDocument?: string;
  tenderDocument: string;
  productType: string;
  plant: string;
  otherDocuments: string[];
  uploadedAt: string;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  customerName: string;
  projectTitle: string;
  projectDetails: string;
  expectedDeliverySchedule: string;
  uploadedAt: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch project");
        }
        const data = await res.json();
        setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Error fetching project details");
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tasks?projectId=${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await res.json();
        setProjectTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error fetching project tasks");
      }
    };

    Promise.all([fetchProject(), fetchTasks()]).finally(() => setLoading(false));
  }, [projectId]);

  // NEW: If logged-in user is a manager, fetch documents for this project.
  useEffect(() => {
    if (user?.role === "manager" && project?.name) {
      fetch(`http://localhost:3000/api/documents?projectTitle=${encodeURIComponent(project.name)}`)
        .then((res) => res.json())
        .then((data) => setProjectDocuments(data))
        .catch((error) => {
          console.error("Error fetching project documents:", error);
          toast.error("Error fetching project documents");
        });
    }
  }, [user, project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const tasksByStatus = {
    completed: projectTasks.filter((t) => t.status === "completed").length,
    inProgress: projectTasks.filter((t) => t.status === "in-progress").length,
    pending: projectTasks.filter((t) => t.status === "pending").length,
    stuck: projectTasks.filter((t) => t.status === "stuck").length,
  };

  const pieChartData = [
    { name: "Completed", value: tasksByStatus.completed, color: "#22C55E" },
    { name: "In Progress", value: tasksByStatus.inProgress, color: "#3B82F6" },
    { name: "Pending", value: tasksByStatus.pending, color: "#EAB308" },
    { name: "Stuck", value: tasksByStatus.stuck, color: "#EF4444" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        {/* Header with Project Title and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
          </div>
          <div className="flex gap-2">
            {/* Allow Create Task for common and manager roles */}
            {(user?.role === "common" || user?.role === "manager") && (
              <button
                onClick={() => navigate(`/project/${projectId}/create-task`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`text-2xl font-semibold ${
              project.status === "active" ? "text-green-600" :
              project.status === "completed" ? "text-blue-600" :
              "text-yellow-600"
            }`}>{project.status}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-gray-500">Budget</h3>
            <p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-gray-500">Progress</h3>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="text-2xl font-semibold">{project.progress}%</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-gray-500">Priority</h3>
            <p className={`text-2xl font-semibold ${
              project.priority === "high"
                ? "text-red-600"
                : project.priority === "medium"
                ? "text-yellow-600"
                : "text-green-600"
            }`}>{project.priority}</p>
          </div>
        </div>

        {/* Charts and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Task Progress Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Start Date</span>
                <span>{project.startDate}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>End Date</span>
                <span>{project.endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Section for Sales Uploaded Documents (only for managers) */}
        {user?.role === "manager" && (
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Uploaded Documents</h2>
            {projectDocuments.length > 0 ? (
              <ul className="space-y-2">
                {projectDocuments.map((doc) => (
                  <li key={doc.id} className="text-sm">
                    <a
                      href={getDocumentUrl(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {doc.name}
                    </a>
                    <span className="ml-2 text-gray-600">
                      (Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleString()})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded by sales for this project.</p>
            )}
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Tasks</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 text-left">Task</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Priority</th>
                <th className="p-4 text-left">Progress</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="p-4">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "stuck"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(task.completedSubtasks / task.totalSubtasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{task.dueDate}</td>
                  <td className="p-4">
                    {user?.role === "sales" ? (
                      <button
                        disabled
                        className="flex items-center gap-2 px-3 py-1 bg-gray-300 text-white rounded-lg cursor-not-allowed"
                      >
                        View
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          user?.role === "manager"
                            ? navigate(`/task/${task.id}/journey`)
                            : navigate(`/task/${task.id}/respond`)
                        }
                        className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        View
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
