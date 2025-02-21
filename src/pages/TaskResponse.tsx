
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockTasks } from "@/data/mockData";
import { toast } from "sonner";

const TaskResponse = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState("");

  const task = mockTasks.find((t) => t.id === taskId);

  if (!task) {
    return <div>Task not found</div>;
  }

  const handleApprove = () => {
    // Add approval logic here
    toast.success("Task approved successfully!");
    navigate("/dashboard");
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    // Add comment logic here
    toast.success("Comment added successfully!");
    setComment("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{task.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <div className="space-y-2">
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleApprove}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Task
              </button>
              <form onSubmit={handleComment} className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Add a comment..."
                  rows={4}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Comment
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {task.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border rounded-lg bg-gray-50 space-y-2"
              >
                <p className="text-gray-600">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  Posted on: {comment.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskResponse;
