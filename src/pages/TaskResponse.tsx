
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
  const [attachments, setAttachments] = useState<FileList | null>(null);

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

  const handleAttachments = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachments && attachments.length > 0) {
      // In a real application, you would upload these files to a server
      toast.success("Attachments added successfully!");
      setAttachments(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{task.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{task.description}</p>
              </div>
              <div>
                <h3 className="font-medium">Customer</h3>
                <p className="text-gray-600">{task.projectDetails.customerName}</p>
              </div>
              <div>
                <h3 className="font-medium">Project</h3>
                <p className="text-gray-600">{task.projectDetails.projectTitle}</p>
              </div>
              <div>
                <h3 className="font-medium">Delivery Date Range</h3>
                <p className="text-gray-600">
                  {task.projectDetails.deliveryDateRange.start} to {task.projectDetails.deliveryDateRange.end}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Plant</h3>
                <p className="text-gray-600">{task.projectDetails.plant}</p>
              </div>
              <div>
                <h3 className="font-medium">Product Type</h3>
                <p className="text-gray-600">{task.projectDetails.productType}</p>
              </div>
              <div>
                <h3 className="font-medium">Specifications</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Inline Inspection: {task.projectDetails.inlineInspection ? "Yes" : "No"}</li>
                  <li>QAP Criteria: {task.projectDetails.qapCriteria ? "Yes" : "No"}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="space-y-2">
              {task.projectDetails.technicalSpecsDoc && (
                <a href={task.projectDetails.technicalSpecsDoc} className="block text-primary hover:underline">
                  Technical Specifications
                </a>
              )}
              {task.projectDetails.qapDocument && (
                <a href={task.projectDetails.qapDocument} className="block text-primary hover:underline">
                  QAP Document
                </a>
              )}
              {task.projectDetails.tenderDocument && (
                <a href={task.projectDetails.tenderDocument} className="block text-primary hover:underline">
                  Tender Document
                </a>
              )}
              {task.projectDetails.otherDocuments?.map((doc, index) => (
                <a key={index} href={doc} className="block text-primary hover:underline">
                  Other Document {index + 1}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleApprove}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Task
              </button>
              
              <form onSubmit={handleAttachments} className="space-y-2">
                <label className="block text-sm font-medium">Add Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(e.target.files)}
                  className="w-full"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upload Attachments
                </button>
              </form>

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
    </div>
  );
};

export default TaskResponse;

