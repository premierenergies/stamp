// TaskJourney.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

interface ActivityLog {
  _id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

interface Task {
  id: string;
  projectId: string;
  projectDetails: {
    customerId: string;
  };
  title: string;
  responses: Array<{
    userId: string;
    userName: string;
    status: string;
    reason: string;
    timestamp: string;
  }>;
}

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

const TaskJourney = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for task details and activity logs from customer, project, and task sources.
  const [task, setTask] = useState<Task | null>(null);
  const [customerLogs, setCustomerLogs] = useState<ActivityLog[]>([]);
  const [projectLogs, setProjectLogs] = useState<ActivityLog[]>([]);
  const [taskLogs, setTaskLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // For reassigning and sending back
  const [reassignUsers, setReassignUsers] = useState<string[]>([]);
  const [forwardComment, setForwardComment] = useState("");
  const [backwardReason, setBackwardReason] = useState("");

  // Fetch task details (including responses)
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
        if (!res.ok) throw new Error("Failed to fetch task details");
        const data = await res.json();
        setTask(data.task);
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Error fetching task details");
      }
    };
    fetchTaskDetails();
  }, [taskId]);

  // Once task is loaded, fetch related activity logs
  useEffect(() => {
    if (task && task.projectId && task.projectDetails?.customerId) {
      const fetchLogs = async () => {
        try {
          const [custRes, projRes, taskRes] = await Promise.all([
            fetch(`http://localhost:3000/api/activity/customer/${task.projectDetails.customerId}`),
            fetch(`http://localhost:3000/api/activity/project/${task.projectId}`),
            fetch(`http://localhost:3000/api/tasks/${taskId}/activity`)
          ]);
          if (!custRes.ok) throw new Error("Failed to fetch customer logs");
          if (!projRes.ok) throw new Error("Failed to fetch project logs");
          if (!taskRes.ok) throw new Error("Failed to fetch task logs");
          const custLogs = await custRes.json();
          const projLogs = await projRes.json();
          const tLogs = await taskRes.json();
          setCustomerLogs(custLogs);
          setProjectLogs(projLogs);
          setTaskLogs(tLogs);
        } catch (error) {
          console.error("Error fetching logs:", error);
          toast.error("Error fetching logs");
        }
      };
      fetchLogs();
    }
  }, [task, taskId]);

  // Fetch all users (for reassign dropdown)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      }
    };
    fetchUsers();
  }, []);

  // Mark loading as false when task is fetched
  useEffect(() => {
    if (task) {
      setLoading(false);
    }
  }, [task, customerLogs, projectLogs, taskLogs]);

  // Combine all logs and sort them by timestamp
  const allLogs: ActivityLog[] = [...customerLogs, ...projectLogs, ...taskLogs];
  allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Handler for reassigning task
  const handleReassign = async () => {
    if (!reassignUsers.length) {
      toast.error("Please select at least one user to reassign the task.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAssignedUsers: reassignUsers, forwardedBy: user?.id, comment: forwardComment })
      });
      if (!res.ok) throw new Error("Failed to reassign task");
      const data = await res.json();
      setTask(data.task);
      toast.success("Task reassigned successfully!");
      setReassignUsers([]);
      setForwardComment("");
    } catch (error) {
      console.error("Error reassigning task:", error);
      toast.error("Error reassigning task");
    }
  };

  // Handler for sending task back
  const handleSendBack = async () => {
    if (!backwardReason) {
      toast.error("Please provide a reason for sending the task back.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/backward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: backwardReason, sentBy: user?.id })
      });
      if (!res.ok) throw new Error("Failed to send task back");
      const data = await res.json();
      setTask(data.task);
      toast.success("Task sent back successfully!");
      setBackwardReason("");
    } catch (error) {
      console.error("Error sending task back:", error);
      toast.error("Error sending task back");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-primary hover:text-primary/80 flex items-center gap-1 mb-4"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold mb-6">Task Journey: {task?.title}</h1>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-gray-300 ml-8 mb-8">
          {allLogs.map((log, index) => (
            <div key={log._id} className="mb-8 flex items-start">
              <div className="absolute -left-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                {index !== allLogs.length - 1 && <div className="flex-1 w-px bg-gray-300 mt-1"></div>}
              </div>
              <div className="ml-6 bg-white p-4 rounded-lg shadow-md w-full">
                <h3 className="font-semibold text-lg">{log.action}</h3>
                <p className="text-gray-700">{log.details}</p>
                <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Responses List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Responses</h2>
          {task?.responses && task.responses.length > 0 ? (
            <div className="space-y-4">
              {task.responses.map((response, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-white shadow">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{response.userName}</span>
                    <span className="text-sm text-gray-500">{new Date(response.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">Status: {response.status}</p>
                  <p className="text-gray-700">Comment: {response.reason || "N/A"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No responses yet.</p>
          )}
        </div>

        {/* Reassign Task Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Reassign Task</h2>
          <p className="mb-2">Select user(s) to reassign the task:</p>
          <select
            multiple
            className="w-full border p-2 rounded-lg mb-4"
            value={reassignUsers}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setReassignUsers(selected);
            }}
          >
            {users
              .filter(u => u.role !== "sales") // Exclude sales users
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          <textarea
            placeholder="Optional: Add a comment for reassignment"
            className="w-full border p-2 rounded-lg mb-4"
            value={forwardComment}
            onChange={(e) => setForwardComment(e.target.value)}
          />
          <button
            onClick={handleReassign}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reassign Task
          </button>
        </div>

        {/* Send Task Back Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Send Task Back</h2>
          <textarea
            placeholder="Enter reason for sending task back"
            className="w-full border p-2 rounded-lg mb-4"
            value={backwardReason}
            onChange={(e) => setBackwardReason(e.target.value)}
          />
          <button
            onClick={handleSendBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Send Task Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskJourney;
