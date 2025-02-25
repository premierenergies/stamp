import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

const TaskResponse = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch task");
        }
        const data = await res.json();
        setTask(data.task);
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Error fetching task details");
      }
    };
    fetchTask();
  }, [taskId]);

  if (!task) {
    return <div className="p-6">Task not found</div>;
  }

  // Use fallback for projectDetails if missing.
  const projectDetails = task.projectDetails || {
    customerName: "N/A",
    projectTitle: "N/A",
    // Ensure deliveryDateRange is defined even if missing in task data.
    deliveryDateRange: { start: "N/A", end: "N/A" },
    plant: "N/A",
    productType: "N/A",
    inlineInspection: false,
    qapCriteria: false,
    technicalSpecsDoc: "",
    qapDocument: "",
    tenderDocument: "",
    otherDocuments: [],
  };

  // Ensure deliveryDateRange exists.
  const deliveryDateRange = projectDetails.deliveryDateRange || { start: "N/A", end: "N/A" };

  const handleApprove = () => {
    toast.success("Task approved successfully!");
    navigate("/dashboard");
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Comment added successfully!");
    setComment("");
  };

  const handleAttachments = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachments && attachments.length > 0) {
      toast.success("Attachments added successfully!");
      setAttachments(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
                  <p className="text-gray-600">{projectDetails.customerName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Project</h3>
                  <p className="text-gray-600">{projectDetails.projectTitle}</p>
                </div>
                <div>
                  <h3 className="font-medium">Delivery Date Range</h3>
                  <p className="text-gray-600">
                    {deliveryDateRange.start} to {deliveryDateRange.end}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Plant</h3>
                  <p className="text-gray-600">{projectDetails.plant}</p>
                </div>
                <div>
                  <h3 className="font-medium">Product Type</h3>
                  <p className="text-gray-600">{projectDetails.productType}</p>
                </div>
                <div>
                  <h3 className="font-medium">Specifications</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Inline Inspection: {projectDetails.inlineInspection ? "Yes" : "No"}</li>
                    <li>QAP Criteria: {projectDetails.qapCriteria ? "Yes" : "No"}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <div className="space-y-2">
                {projectDetails.technicalSpecsDoc ? (
                  <a
                    href={projectDetails.technicalSpecsDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    Technical Specifications
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
                {projectDetails.qapDocument ? (
                  <a
                    href={projectDetails.qapDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    QAP Document
                  </a>
                ) : projectDetails.qapCriteria ? (
                  <p className="text-gray-500">N/A</p>
                ) : null}
                {projectDetails.tenderDocument ? (
                  <a
                    href={projectDetails.tenderDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    Tender Document
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
                {projectDetails.otherDocuments && projectDetails.otherDocuments.length > 0 ? (
                  projectDetails.otherDocuments.map((doc: string, index: number) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      Other Document {index + 1}
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
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
                    required
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
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="p-4 border rounded-lg bg-gray-50 space-y-2"
                    >
                      <p className="text-gray-600">{comment.content}</p>
                      <p className="text-sm text-gray-500">
                        Posted on: {comment.timestamp}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskResponse;
