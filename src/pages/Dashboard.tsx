
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, ArrowRight, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { mockCustomers, mockTasks } from "@/data/mockData";
import Header from "@/components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "common") {
    const assignedTasks = mockTasks.filter(task => 
      task.assignedUsers.includes(user.username)
    );

    const tasksByStatus = {
      completed: assignedTasks.filter(t => t.status === "completed").length,
      inProgress: assignedTasks.filter(t => t.status === "in-progress").length,
      pending: assignedTasks.filter(t => t.status === "pending").length,
      stuck: assignedTasks.filter(t => t.status === "stuck").length,
    };

    const chartData = [
      { name: "Completed", value: tasksByStatus.completed },
      { name: "In Progress", value: tasksByStatus.inProgress },
      { name: "Pending", value: tasksByStatus.pending },
      { name: "Stuck", value: tasksByStatus.stuck },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <p className="text-2xl font-semibold">{tasksByStatus.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold">{tasksByStatus.inProgress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stuck Tasks</p>
                  <p className="text-2xl font-semibold">{tasksByStatus.stuck}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Task Status Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Project Name
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "stuck"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/task/${task.id}/respond`)}
                        className="text-primary hover:text-primary/80 flex items-center gap-1"
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
  }

  // Sales and Manager see customer tiles
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
              Sort
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{customer.name}</h3>
                <p className="text-gray-500">{customer.industry}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="text-lg font-semibold">{customer.activeProjects}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-lg font-semibold">
                    ${customer.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role === "sales" && (
                  <button
                    onClick={() => {
                      /* Add create project logic */
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </button>
                )}
                <button
                  onClick={() => navigate(`/projects/${customer.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Projects
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
