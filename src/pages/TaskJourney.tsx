
import { useAuth } from "@/contexts/AuthContext";
import { mockTasks } from "@/data/mockData";

const TaskJourney = () => {
  const { user } = useAuth();
  const completedTasks = mockTasks.filter(
    (task) => task.status === "completed" || task.status === "approved"
  );
  const stuckTasks = mockTasks.filter((task) => task.status === "stuck");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Task Journey</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg bg-green-50 space-y-2"
              >
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Completed on: {task.dueDate}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Stuck Tasks</h2>
          <div className="space-y-4">
            {stuckTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg bg-red-50 space-y-2"
              >
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskJourney;
