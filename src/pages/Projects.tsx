
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { mockProjects, mockCustomers } from "@/data/mockData";

const Projects = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  const customer = mockCustomers.find((c) => c.id === customerId);
  const customerProjects = mockProjects.filter((p) => p.customerId === customerId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{customer?.name} Projects</h1>
      <div className="rounded-lg border shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">Project Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Budget</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerProjects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-4">{project.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="p-4">{project.startDate}</td>
                <td className="p-4">{project.endDate}</td>
                <td className="p-4">${project.budget.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    project.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : project.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {project.priority}
                  </span>
                </td>
                <td className="p-4">
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
      </div>
    </div>
  );
};

export default Projects;
