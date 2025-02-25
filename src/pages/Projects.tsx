import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string;
  industry?: string;
  projects: Project[];
  activeProjects?: number;
  totalBudget?: number;
  createdAt: string;
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
  // other fields as needed
}

const Projects = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/customers/${customerId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch customer");
        }
        const data = await res.json();
        setCustomer(data.customer);
        setProjects(data.customer.projects || []);
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            {customer.industry && (
              <p className="text-gray-500">{customer.industry}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-semibold">
                ${customer.totalBudget ? customer.totalBudget.toLocaleString() : 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-xl font-semibold">
                {customer.activeProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {projects.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === "active"
                            ? "bg-green-100 text-green-800"
                            : project.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {project.progress}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.startDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${project.budget ? project.budget.toLocaleString() : 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : project.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div>Total: {project.tasks?.total || 0}</div>
                        <div className="text-green-600">
                          Complete: {project.tasks?.completed || 0}
                        </div>
                        <div className="text-red-600">
                          Stuck: {project.tasks?.stuck || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/project/${project.id}`)}
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
          ) : (
            <div className="p-6 text-center text-gray-500">No projects found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;