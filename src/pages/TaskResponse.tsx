// TaskResponse.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Checkbox } from "@/components/ui/checkbox"; // Added missing import

// Replace your existing getDocumentUrl with this version
const getDocumentUrl = (docPath: string): string => {
  if (!docPath) return "";
  const origin = window.location.origin; // Use the current origin dynamically
  if (docPath.startsWith("C:\\fakepath\\")) {
    const filename = docPath.split("\\").pop();
    return `${origin}/uploads/${filename}`;
  }
  if (docPath.startsWith("/uploads/")) {
    return `${origin}${docPath}`;
  }
  if (docPath.startsWith("http")) {
    return docPath;
  }
  return docPath;
};

const TaskResponse = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [forwardUsers, setForwardUsers] = useState<string[]>([]);
  const [backwardReason, setBackwardReason] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [hasResponded, setHasResponded] = useState(false);
  const [userResponse, setUserResponse] = useState<any>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch task");
        }
        const data = await res.json();
        setTask(data.task);
        // Check if current user has responded
        const response = data.task.responses.find((r: any) => r.userId === user?.id);
        if (response) {
          setHasResponded(true);
          setUserResponse(response);
        } else {
          setHasResponded(false);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Error fetching task details");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      }
    };

    fetchTask();
    fetchUsers();
  }, [taskId, user]);

  // If the logged-in user is a manager, redirect to TaskJourney.
  useEffect(() => {
    if (user && user.role === "manager" && task) {
      navigate(`/task/${task.id}/journey`);
    }
  }, [user, task, navigate]);

  if (!task) {
    return <div className="p-6">Task not found</div>;
  }

  const projectDetails = task.projectDetails || {
    customerName: "N/A",
    projectTitle: "N/A",
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

  const deliveryDateRange = projectDetails.deliveryDateRange || { start: "N/A", end: "N/A" };

  const handleApprove = () => {
    if (hasResponded) {
      toast.error("You have already responded to this task.");
      return;
    }
    const formData = new FormData();
    formData.append("userId", user?.id || "");
    formData.append("userName", user?.name || "");
    formData.append("status", "approved");
    formData.append("reason", "");
    fetch(`http://localhost:3000/api/tasks/${task.id}/respond`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Task approved successfully!");
        setTask(data.task);
        setHasResponded(true);
        const response = data.task.responses.find((r: any) => r.userId === user?.id);
        setUserResponse(response);
      })
      .catch((err) => {
        console.error("Error approving task:", err);
        toast.error("Error approving task");
      });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasResponded) {
      toast.error("You have already responded to this task.");
      return;
    }
    const formData = new FormData();
    formData.append("userId", user?.id || "");
    formData.append("userName", user?.name || "");
    formData.append("status", "rejected"); // Using 'rejected' to indicate comment
    formData.append("reason", comment);
    fetch(`http://localhost:3000/api/tasks/${task.id}/respond`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Comment added successfully!");
        setComment("");
        setTask(data.task);
        setHasResponded(true);
        const response = data.task.responses.find((r: any) => r.userId === user?.id);
        setUserResponse(response);
      })
      .catch((err) => {
        console.error("Error adding comment:", err);
        toast.error("Error adding comment");
      });
  };

  const handleAttachments = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasResponded) {
      toast.error("You have already responded to this task.");
      return;
    }
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append("userId", user?.id || "");
      formData.append("userName", user?.name || "");
      formData.append("status", "approved");
      formData.append("reason", "");
      Array.from(attachments).forEach(file => {
        formData.append("file", file);
      });
      fetch(`http://localhost:3000/api/tasks/${task.id}/respond`, {
        method: "PUT",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          toast.success("Attachments added successfully!");
          setAttachments(null);
          setTask(data.task);
          setHasResponded(true);
          const response = data.task.responses.find((r: any) => r.userId === user?.id);
          setUserResponse(response);
        })
        .catch((err) => {
          console.error("Error adding attachments:", err);
          toast.error("Error adding attachments");
        });
    }
  };

  const handleForward = () => {
    fetch(`http://localhost:3000/api/tasks/${task.id}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newAssignedUsers: forwardUsers, forwardedBy: user?.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Task forwarded successfully!");
        setTask(data.task);
        setForwardUsers([]);
      })
      .catch((err) => {
        console.error("Error forwarding task:", err);
        toast.error("Error forwarding task");
      });
  };

  const handleBackward = () => {
    fetch(`http://localhost:3000/api/tasks/${task.id}/backward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: backwardReason, sentBy: user?.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Task sent back successfully!");
        setTask(data.task);
        setBackwardReason("");
      })
      .catch((err) => {
        console.error("Error sending task back:", err);
        toast.error("Error sending task back");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        {hasResponded && userResponse && (
          <div className="bg-green-50 border p-4 rounded-lg mb-4">
            <p className="text-green-800">You have already responded to this task.</p>
            <p className="text-sm text-gray-600">
              Your response: {userResponse.status} – {userResponse.reason}
            </p>
          </div>
        )}
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
                    href={getDocumentUrl(projectDetails.technicalSpecsDoc)}
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
                    href={getDocumentUrl(projectDetails.qapDocument)}
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
                    href={getDocumentUrl(projectDetails.tenderDocument)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    Tender Document
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
                {Array.isArray(projectDetails.otherDocuments) && projectDetails.otherDocuments.length > 0 ? (
                  projectDetails.otherDocuments.map((doc: string, index: number) => (
                    <a
                      key={index}
                      href={getDocumentUrl(doc)}
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
                  disabled={hasResponded}
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
                    disabled={hasResponded}
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
                    disabled={hasResponded}
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    disabled={hasResponded}
                  >
                    Add Comment
                  </button>
                </form>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Forward Task</h3>
                  <div className="space-y-2">
                    {allUsers.map((u) => (
                      <div key={u.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`forward-${u.id}`}
                          checked={forwardUsers.includes(u.id.toString())}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setForwardUsers([...forwardUsers, u.id.toString()]);
                            } else {
                              setForwardUsers(forwardUsers.filter(id => id !== u.id.toString()));
                            }
                          }}
                        />
                        <label htmlFor={`forward-${u.id}`}>{u.name}</label>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleForward}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                  >
                    Forward Task
                  </button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Send Back Task</h3>
                  <textarea
                    value={backwardReason}
                    onChange={(e) => setBackwardReason(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter reason for sending back..."
                    rows={2}
                    required
                  />
                  <button
                    onClick={handleBackward}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors mt-2"
                  >
                    Send Back Task
                  </button>
                </div>
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
