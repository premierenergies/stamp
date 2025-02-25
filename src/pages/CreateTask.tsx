import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

const userList = [
  { id: "s", name: "Sales Team Member" },
  { id: "p", name: "Praful" },
  { id: "c", name: "Common User" },
];

const CreateTask = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchProjectAndCustomer = async () => {
      try {
        const projectRes = await fetch(`http://localhost:3000/api/projects/${projectId}`);
        if (!projectRes.ok) throw new Error("Failed to fetch project");
        const projectData = await projectRes.json();
        setProject(projectData.project);
        
        const customerRes = await fetch(`http://localhost:3000/api/customers/${projectData.project.customerId}`);
        if (!customerRes.ok) throw new Error("Failed to fetch customer");
        const customerData = await customerRes.json();
        setCustomer(customerData.customer);
      } catch (error) {
        console.error("Error fetching project or customer:", error);
        toast.error("Error fetching project details");
      } finally {
        setLoading(false);
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

    fetchProjectAndCustomer();
    fetchUsers();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !customer) {
      toast.error("Project or customer not found");
      return;
    }
    const formData = new FormData();
    formData.append("projectId", projectId!);
    formData.append("projectName", project.name);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("assignedUsers", JSON.stringify(assignedUsers));
    formData.append("createdBy", user?.id || "");
    if (attachments) {
      Array.from(attachments).forEach((file) => {
        formData.append("files", file);
      });
    }
    try {
      const res = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to create task");
      }
      toast.success("Task created successfully!");
      navigate(`/project/${projectId}`);
    } catch (err: any) {
      console.error("Error creating task:", err);
      toast.error(err.message || "Error creating task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project || !customer) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Create New Task</h1>
        {/* Read-only Project Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Project Details (Read-only)</h2>
          {/* Basic Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <input
                type="text"
                value={customer.name}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <input
                type="text"
                value={project.name}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plant</label>
              <input
                type="text"
                value={project.plant}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Type</label>
              <input
                type="text"
                value={project.productType}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>
          {/* Additional Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Details</label>
              <textarea
                value={project.description}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Start Date</label>
              <input
                type="date"
                value={project.startDate}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery End Date</label>
              <input
                type="date"
                value={project.endDate}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Inline Inspection</label>
              <input
                type="text"
                value={project.inlineInspection ? "Yes" : "No"}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Technical Specifications Document</label>
              {project.technicalSpecsDoc ? (
                <a
                  href={project.technicalSpecsDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  View Document
                </a>
              ) : (
                <input
                  type="text"
                  value="N/A"
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">QAP Criteria</label>
              <input
                type="text"
                value={project.qapCriteria ? "Yes" : "No"}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            {project.qapCriteria && (
              <div>
                <label className="block text-sm font-medium mb-1">QAP Document</label>
                {project.qapDocument ? (
                  <a
                    href={project.qapDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    View QAP Document
                  </a>
                ) : (
                  <input
                    type="text"
                    value="N/A"
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Tender Document</label>
              {project.tenderDocument ? (
                <a
                  href={project.tenderDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  View Tender Document
                </a>
              ) : (
                <input
                  type="text"
                  value="N/A"
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Documents</label>
              {Array.isArray(project.otherDocuments) && project.otherDocuments.length > 0 ? (
                project.otherDocuments.map((doc: string, index: number) => (
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
                <input
                  type="text"
                  value="N/A"
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              )}
            </div>
          </div>
        </div>
        {/* Task Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
              required
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Assign Users</label>
            <div className="space-y-2">
              {allUsers.map((u) => (
                <div key={u.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${u.id}`}
                    checked={assignedUsers.includes(u.id.toString())}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAssignedUsers([...assignedUsers, u.id.toString()]);
                      } else {
                        setAssignedUsers(assignedUsers.filter(id => id !== u.id.toString()));
                      }
                    }}
                  />
                  <label htmlFor={`user-${u.id}`}>{u.name}</label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="attachments" className="block text-sm font-medium mb-1">
              Attachments
            </label>
            <input
              id="attachments"
              type="file"
              multiple
              onChange={(e) => setAttachments(e.target.files)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Task
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateTask;
