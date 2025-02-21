
import { useAuth } from "@/contexts/AuthContext";
import { mockTasks } from "@/data/mockData";
import Header from "@/components/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const TaskJourney = () => {
  const { user } = useAuth();
  const completedTasks = mockTasks.filter(
    (task) => task.status === "completed" || task.status === "approved"
  );
  const stuckTasks = mockTasks.filter((task) => task.status === "stuck");

  // Calculate metrics
  const totalTasks = mockTasks.length;
  const completionRate = (completedTasks.length / totalTasks) * 100;
  const avgTimeSpent = completedTasks.reduce((acc, task) => acc + task.timeSpent, 0) / completedTasks.length;

  const pieData = [
    { name: "Completed", value: completedTasks.length, color: "#22C55E" },
    { name: "Stuck", value: stuckTasks.length, color: "#EF4444" },
  ];

  const timelineData = completedTasks.map(task => ({
    name: task.title,
    timeSpent: task.timeSpent,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Task Journey</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {completedTasks.length} out of {totalTasks} tasks completed
            </p>
          </div>
          
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Average Time Spent</h3>
            <p className="text-3xl font-bold text-blue-600">{avgTimeSpent.toFixed(1)}h</p>
            <p className="text-sm text-gray-500 mt-1">Per completed task</p>
          </div>
          
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Stuck Tasks</h3>
            <p className="text-3xl font-bold text-red-600">{stuckTasks.length}</p>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Time Spent Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="timeSpent" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg bg-green-50 space-y-2 hover:bg-green-100 transition-colors"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Completed on: {task.dueDate}</span>
                    <span>Time spent: {task.timeSpent}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Stuck Tasks</h2>
            <div className="space-y-4">
              {stuckTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg bg-red-50 space-y-2 hover:bg-red-100 transition-colors"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Due: {task.dueDate}</span>
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskJourney;
