
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, ArrowRight } from "lucide-react";
import { mockCustomers } from "@/data/mockData";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "common") {
    // Common user sees their assigned tasks
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="rounded-lg border shadow-sm">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">Task</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Add mock tasks here */}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Sales and Manager see customer tiles
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
          >
            <h3 className="text-xl font-semibold">{customer.name}</h3>
            <p className="text-muted-foreground">{customer.industry}</p>
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
    </div>
  );
};

export default Dashboard;
