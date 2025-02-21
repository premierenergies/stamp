
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { mockProjects, mockTasks } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const project = mockProjects.find((p) => p.id === projectId);
  const projectTasks = mockTasks.filter((t) => t.projectId === projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>
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
          <p className="text-2xl font-semibold">{project.status}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
          <p className="text-2xl font-semibold">${project.budget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
          <p className="text-2xl font-semibold">{project.startDate}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
          <p className="text-2xl font-semibold">{project.endDate}</p>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">Task</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Due Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectTasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="p-4">{task.title}</td>
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
                <td className="p-4">{task.dueDate}</td>
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
    </div>
  );
};

export default ProjectDetail;
