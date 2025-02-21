
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { mockProjects, mockTasks } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Header from "@/components/Header";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const project = mockProjects.find((p) => p.id === projectId);
  const projectTasks = mockTasks.filter((t) => t.projectId === projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  const tasksByStatus = {
    completed: projectTasks.filter(t => t.status === "completed").length,
    inProgress: projectTasks.filter(t => t.status === "in-progress").length,
    pending: projectTasks.filter(t => t.status === "pending").length,
    stuck: projectTasks.filter(t => t.status === "stuck").length,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
          </div>
          {user?.role === "manager" && (
            <button
              onClick={() => navigate(`/project/${projectId}/create-task`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <p className={`text-2xl font-semibold ${
              project.status === "active" ? "text-green-600" :
              project.status === "completed" ? "text-blue-600" :
              "text-yellow-600"
            }`}>{project.status}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
            <p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
            <p className={`text-2xl font-semibold ${
              project.priority === "high" ? "text-red-600" :
              project.priority === "medium" ? "text-yellow-600" :
              "text-green-600"
            }`}>{project.priority}</p>
          </div>
        </div>

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
                  className="h-2 bg-primary rounded-full"
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

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Tasks</h2>
          </div>
          <table className="w-full">
            <thead className="bg-muted">
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
                    <button
                      onClick={() => navigate(`/task/${task.id}/respond`)}
                      className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
