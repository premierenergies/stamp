
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockCustomers, mockProjects } from "@/data/mockData";
import { Task, Project } from "@/types/project";

const userList = [
  { id: "s", name: "Sales Team Member" },
  { id: "p", name: "Praful" },
  { id: "c", name: "Common User" },
];

const CreateTask = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const project = mockProjects.find((p) => p.id === projectId);
  const customer = mockCustomers.find((c) => c.id === project?.customerId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !customer) {
      toast.error("Project or customer not found");
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      title,
      description,
      status: "pending",
      assignedUsers,
      dueDate,
      comments: [],
      created: new Date().toISOString(),
      priority: "medium",
      timeSpent: 0,
      completedSubtasks: 0,
      totalSubtasks: 0,
      projectDetails: {
        customerName: customer.name,
        projectTitle: project.name,
        projectDescription: project.description,
        deliveryDateRange: {
          start: project.startDate,
          end: project.endDate,
        },
        inlineInspection: project.inlineInspection,
        technicalSpecsDoc: project.technicalSpecsDoc,
        qapCriteria: project.qapCriteria,
        qapDocument: project.qapDocument,
        tenderDocument: project.tenderDocument,
        productType: project.productType,
        plant: project.plant,
        otherDocuments: project.otherDocuments,
        uploadedAt: project.uploadedAt,
      },
      attachments: attachments ? Array.from(attachments).map(file => URL.createObjectURL(file)) : undefined,
    };

    // Save to localStorage
    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    localStorage.setItem("tasks", JSON.stringify([...existingTasks, newTask]));

    toast.success("Task created successfully!");
    navigate(`/project/${projectId}`);
  };

  if (!project || !customer) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Task</h1>
      
      {user?.role === "manager" && (
        <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Project Details (Read-only)</h2>
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
        </div>
      )}

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

        {user?.role === "manager" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Assign Users</label>
              <div className="space-y-2">
                {userList.map((u) => (
                  <div key={u.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${u.id}`}
                      checked={assignedUsers.includes(u.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignedUsers([...assignedUsers, u.id]);
                        } else {
                          setAssignedUsers(assignedUsers.filter(id => id !== u.id));
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
          </>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTask;

