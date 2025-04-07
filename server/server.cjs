// server.cjs
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const { ClientSecretCredential } = require("@azure/identity");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the absolute uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(
    "mongodb+srv://aarnavsingh836:Cucumber1729@rr.oldse8x.mongodb.net/?retryWrites=true&w=majority&appName=rr",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000000,
      socketTimeoutMS: 45000000,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Use an absolute path for the destination folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });
const responseUpload = multer({ storage });

const CLIENT_ID = "5a58e660-dc7b-49ec-a48c-1fffac02f721";
const CLIENT_SECRET = "6_I8Q~U7IbS~NERqNeszoCRs2kETiO1Yc3cXAaup";
const TENANT_ID = "1c3de7f3-f8d1-41d3-8583-2517cf3ba3b1";
const SENDER_EMAIL = "leaf@premierenergies.com";

const credential = new ClientSecretCredential(
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET
);

const client = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
      return tokenResponse.token;
    },
  },
});

// Updated USERS using hardcoded credentials
const USERS = [
  { id: 1, username: "s", password: "s", role: "sales", name: "Sales Team Member" },
  { id: 2, username: "p", password: "p", role: "manager", name: "Praful" },
  { id: 3, username: "a", password: "a", role: "common", name: "Common User 1" },
  { id: 4, username: "b", password: "b", role: "common", name: "Common User 2" },
  { id: 5, username: "c", password: "c", role: "common", name: "Common User 3" },
  { id: 6, username: "d", password: "d", role: "common", name: "Common User 4" },
  { id: 7, username: "e", password: "e", role: "common", name: "Common User 5" },
];

// Customer Schema – industry is now optional
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: false },
  projects: { type: Array, default: [] },
  activeProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Customer = mongoose.model("Customer", customerSchema);

app.get("/api/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    const activeProjects = customer.projects.filter(p => p.status === "active").length;
    const completedProjects = customer.projects.filter(p => p.status === "completed").length;
    const totalBudget = customer.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    res.json({
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        industry: customer.industry,
        projects: customer.projects,
        activeProjects,
        completedProjects,
        totalBudget,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    const mappedCustomers = customers.map(c => {
      const activeProjects = c.projects.filter(p => p.status === "active").length;
      const completedProjects = c.projects.filter(p => p.status === "completed").length;
      const totalBudget = c.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      return {
        id: c._id.toString(),
        name: c.name,
        industry: c.industry,
        projects: c.projects,
        activeProjects,
        completedProjects,
        totalBudget,
        createdAt: c.createdAt,
      };
    });
    res.json(mappedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, industry, createdBy } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const newCustomer = await Customer.create({ name, industry });
    await createActivityLog("Customer Creation", createdBy || "unknown", `Customer ${newCustomer.name} created.`);
    res.status(201).json({ customer: newCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Error creating customer" });
  }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  name: String,
  url: String,
  uploadedBy: String,
  customerName: String,
  projectTitle: String,
  projectDetails: String,
  expectedDeliverySchedule: Date,
  uploadedAt: { type: Date, default: Date.now },
});
const Document = mongoose.model("Document", documentSchema);

// Task Response Schema
const taskResponseSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  status: { type: String, enum: ["approved", "rejected"] },
  reason: String,
  fileUrl: String,
  late: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

// Task Schema 
const taskSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "in-progress", "completed", "stuck", "approved", "backward"], default: "pending" },
  assignedUsers: { type: [String], default: [] },
  dueDate: { type: String, required: true },
  attachments: { type: [{ name: String, url: String }], default: [] },
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
  responses: { type: [taskResponseSchema], default: [] },
  isLate: { type: Boolean, default: false },
  finalSignOff: {
    users: { type: [String], default: [] },
    comments: String,
    timestamp: Date,
  },
  projectDetails: { type: Object, default: {} },
  stuckWith: { type: [String], default: [] }
});
const Task = mongoose.model("Task", taskSchema);

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  action: String,
  userId: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
});
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
async function createActivityLog(action, userId, details) {
  await ActivityLog.create({ action, userId, details });
}

// Endpoints
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
});

app.get("/api/users", (req, res) => {
  const usersWithoutPasswords = USERS.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPasswords);
});

app.get("/api/documents", async (req, res) => {
  try {
    let query = {};
    if (req.query.uploadedBy) query.uploadedBy = req.query.uploadedBy;
    if (req.query.projectTitle) query.projectTitle = req.query.projectTitle; // filter by projectTitle
    const docs = await Document.find(query);
    res.json(
      docs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        url: d.url,
        uploadedBy: d.uploadedBy,
        customerName: d.customerName,
        projectTitle: d.projectTitle,
        projectDetails: d.projectDetails,
        expectedDeliverySchedule: d.expectedDeliverySchedule,
        uploadedAt: d.uploadedAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Error fetching documents" });
  }
});

app.put("/api/documents/:docId", upload.single("file"), async (req, res) => {
  try {
    const { docId } = req.params;
    const updateFields = {
      customerName: req.body.customerName,
      projectTitle: req.body.projectTitle,
      projectDetails: req.body.projectDetails,
      expectedDeliverySchedule: req.body.expectedDeliverySchedule ? new Date(req.body.expectedDeliverySchedule) : null,
    };
    if (req.file) {
      updateFields.name = req.file.originalname;
      updateFields.url = "/uploads/" + req.file.filename;
    }
    const updatedDoc = await Document.findByIdAndUpdate(docId, updateFields, { new: true });
    await createActivityLog("Document Edit", req.body.uploadedBy, `Document ${updatedDoc.name} edited.`);
    const prafulUser = USERS.find((u) => u.name === "Praful");
    if (prafulUser) {
      await sendOutlookNotification(
        [prafulUser.email],
        `Document Edited: ${updatedDoc.name}`,
        `The document has been edited.\nCustomer: ${updatedDoc.customerName}\nProject Title: ${updatedDoc.projectTitle}\nDetails: ${updatedDoc.projectDetails}\nExpected Delivery: ${updatedDoc.expectedDeliverySchedule}`
      );
    }
    res.json({ document: updatedDoc });
  } catch (error) {
    console.error("Error editing document:", error);
    res.status(500).json({ message: "Error editing document" });
  }
});

app.post("/api/documents", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const newDocument = await Document.create({
      name: req.file.originalname,
      url: "/uploads/" + req.file.filename,
      uploadedBy: req.body.uploadedBy || "unknown",
      customerName: req.body.customerName,
      projectTitle: req.body.projectTitle,
      projectDetails: req.body.projectDetails,
      expectedDeliverySchedule: req.body.expectedDeliverySchedule ? new Date(req.body.expectedDeliverySchedule) : null,
    });
    await createActivityLog("Document Upload", req.body.uploadedBy, `Document ${req.file.originalname} uploaded.`);
    const uploader = USERS.find((u) => u.id.toString() === req.body.uploadedBy);
    if (uploader && uploader.role === "sales") {
      const prafulUser = USERS.find((u) => u.name === "Praful");
      if (prafulUser) {
        await sendOutlookNotification(
          [prafulUser.email],
          `New Document Submission: ${req.file.originalname}`,
          `A new document has been submitted by ${uploader.name}.\nCustomer: ${req.body.customerName}\nProject Title: ${req.body.projectTitle}\nDetails: ${req.body.projectDetails}\nExpected Delivery: ${req.body.expectedDeliverySchedule}`
        );
      }
    }
    return res.status(201).json({ document: newDocument });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Error uploading document" });
  }
});

// Modified POST /api/projects endpoint using upload.any() to handle file uploads and create Document entries
app.post("/api/projects", upload.any(), async (req, res) => {
  try {
    // Generate a project id if not provided
    const projectId = req.body.id || Math.random().toString(36).substr(2, 9);
    
    const {
      customerId,
      customerName,
      name,
      description,
      status,
      startDate,
      endDate,
      budget,
      priority,
      progress,
      tasks,
      inlineInspection,
      qapCriteria,
      productType,
      plant,
      uploadedAt,
      createdBy,
    } = req.body;
    
    // Process file uploads from the FormData
    let technicalSpecsDoc = "";
    let qapDocument = "";
    let tenderDocument = "";
    let otherDocuments = [];
    
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "technicalSpecsDoc") {
          technicalSpecsDoc = "/uploads/" + file.filename;
        } else if (file.fieldname === "qapDocument") {
          qapDocument = "/uploads/" + file.filename;
        } else if (file.fieldname === "tenderDocument") {
          tenderDocument = "/uploads/" + file.filename;
        } else if (file.fieldname === "otherDocuments") {
          otherDocuments.push("/uploads/" + file.filename);
        }
      });
    }
    
    // Parse tasks if provided (it might be a JSON string)
    let parsedTasks = { total: 0, completed: 0, pending: 0, stuck: 0 };
    if (tasks) {
      try {
        parsedTasks = JSON.parse(tasks);
      } catch (e) {
        parsedTasks = { total: 0, completed: 0, pending: 0, stuck: 0 };
      }
    }
    
    const newProject = {
      id: projectId,
      customerId,
      customerName,
      name,
      description,
      status,
      startDate,
      endDate,
      budget: budget ? Number(budget) : 0,
      priority,
      progress: progress ? Number(progress) : 0,
      tasks: parsedTasks,
      inlineInspection: inlineInspection === "yes",
      technicalSpecsDoc,
      qapCriteria: qapCriteria === "yes",
      qapDocument,
      tenderDocument,
      productType,
      plant,
      otherDocuments,
      uploadedAt,
    };
    
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    customer.projects.push(newProject);
    await customer.save();
    await createActivityLog("Project Creation", createdBy || "unknown", `Project ${newProject.name} created for customer ${customer.name}.`);

    // Create Document entries for each uploaded file so that they are visible to managers.
    if (technicalSpecsDoc) {
      await Document.create({
        name: "Technical Specifications Document",
        url: technicalSpecsDoc,
        uploadedBy: createdBy,
        customerName: customerName,
        projectTitle: name,
        projectDetails: description,
        expectedDeliverySchedule: null,
      });
    }
    if (qapDocument) {
      await Document.create({
        name: "QAP Document",
        url: qapDocument,
        uploadedBy: createdBy,
        customerName: customerName,
        projectTitle: name,
        projectDetails: description,
        expectedDeliverySchedule: null,
      });
    }
    if (tenderDocument) {
      await Document.create({
        name: "Tender Document",
        url: tenderDocument,
        uploadedBy: createdBy,
        customerName: customerName,
        projectTitle: name,
        projectDetails: description,
        expectedDeliverySchedule: null,
      });
    }
    if (otherDocuments && otherDocuments.length > 0) {
      for (const docUrl of otherDocuments) {
        await Document.create({
          name: "Other Document",
          url: docUrl,
          uploadedBy: createdBy,
          customerName: customerName,
          projectTitle: name,
          projectDetails: description,
          expectedDeliverySchedule: null,
        });
      }
    }
    
    res.status(201).json({ project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

app.get("/api/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const customer = await Customer.findOne({ "projects.id": projectId });
    if (!customer) return res.status(404).json({ message: "Project not found" });
    const project = customer.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    } else if (req.query.userId) {
      const user = USERS.find((u) => u.id.toString() === req.query.userId);
      if (user && user.role !== "admin") {
        query.assignedUsers = req.query.userId;
      }
    }
    const tasksDocs = await Task.find(query);
    const tasks = tasksDocs.map((t) => {
      const taskObj = t.toObject();
      taskObj.id = t._id.toString();
      taskObj.isLate = taskObj.status === "pending" && new Date(taskObj.dueDate) < new Date();
      return taskObj;
    });
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.get("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const taskObj = task.toObject();
    taskObj.id = task._id.toString();
    taskObj.isLate = taskObj.status === "pending" && new Date(taskObj.dueDate) < new Date();
    res.json({ task: taskObj });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Error fetching task" });
  }
});

app.post("/api/tasks", upload.array("files"), async (req, res) => {
  try {
    const { projectId, projectName, title, description, assignedUsers, createdBy, dueDate } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId is required" });
    let parsedAssignedUsers = [];
    try {
      parsedAssignedUsers = req.body.assignedUsers ? JSON.parse(req.body.assignedUsers) : [];
    } catch (e) {
      parsedAssignedUsers = [];
    }
    const customer = await Customer.findOne({ "projects.id": projectId });
    if (!customer) return res.status(404).json({ message: "Customer for the project not found" });
    const project = customer.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const newTask = await Task.create({
      projectId,
      projectName,
      title,
      description,
      assignedUsers: parsedAssignedUsers,
      dueDate,
      attachments: req.files ? req.files.map(file => ({ name: file.originalname, url: "/uploads/" + file.filename })) : [],
      createdBy,
      status: "pending",
      projectDetails: project
    });
    try {
      await createActivityLog("Task Creation", createdBy, `Task "${title}" created for project "${projectName}".`);
    } catch (logError) {
      console.error("Activity log error:", logError);
    }
    res.status(201).json({ task: newTask });
  } catch (error) {
    console.error("Error creating tasks:", error);
    res.status(500).json({ message: error.message || "Error creating tasks" });
  }
});

app.put("/api/tasks/:taskId", upload.array("files"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, assignedUsers } = req.body;
    const files = req.files;
    const updateData = {
      title,
      description,
      dueDate,
      assignedUsers: JSON.parse(req.body.assignedUsers),
    };
    if (files && files.length > 0) {
      updateData.attachments = files.map((file) => ({ name: file.originalname, url: "/uploads/" + file.filename }));
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    await createActivityLog("Task Update", req.body.updatedBy || "unknown", `Task ${taskId} updated.`);
    res.json({ task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
});

app.put("/api/tasks/:taskId/respond", responseUpload.single("file"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, userName, status, reason } = req.body;
    const fileUrl = req.file ? "/uploads/" + req.file.filename : "";
    const taskDoc = await Task.findById(taskId);
    if (!taskDoc) return res.status(404).json({ message: "Task not found" });
    if (!taskDoc.assignedUsers.includes(userId.toString())) {
      return res.status(403).json({ message: "User not assigned to this task" });
    }
    const isLate = new Date() > new Date(taskDoc.dueDate);
    const existingResponse = taskDoc.responses.find((r) => r.userId === userId.toString());
    if (existingResponse) {
      existingResponse.status = status;
      existingResponse.reason = reason;
      existingResponse.fileUrl = fileUrl;
      existingResponse.late = isLate;
      existingResponse.timestamp = new Date();
    } else {
      taskDoc.responses.push({
        userId: userId.toString(),
        userName,
        status,
        reason,
        fileUrl,
        late: isLate,
        timestamp: new Date(),
      });
    }
    const responsesMap = {};
    taskDoc.responses.forEach(r => { responsesMap[r.userId] = r.status; });
    const stuckWith = taskDoc.assignedUsers.filter(u => responsesMap[u] !== "approved");
    taskDoc.stuckWith = stuckWith;
    if (stuckWith.length === 0 && taskDoc.assignedUsers.length > 0) {
      taskDoc.status = "approved";
      await createActivityLog("Task Fully Approved", userId, `Task ${taskId} has been fully approved by all assigned users.`);
    } else {
      taskDoc.status = "stuck";
      await createActivityLog("Task Marked Stuck", userId, `Task ${taskId} is stuck. Pending approvals from: ${stuckWith.join(", ")}`);
    }
    await taskDoc.save();
    res.json({ task: taskDoc });
  } catch (error) {
    console.error("Error responding to task:", error);
    res.status(500).json({ message: "Error responding to task" });
  }
});

app.post("/api/tasks/:taskId/forward", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newAssignedUsers, comment } = req.body;
    const taskDoc = await Task.findById(taskId);
    if (!taskDoc) return res.status(404).json({ message: "Task not found" });
    const updatedUsers = Array.from(new Set([...taskDoc.assignedUsers, ...newAssignedUsers]));
    taskDoc.assignedUsers = updatedUsers;
    const logMessage = comment 
      ? `Task ${taskId} forwarded to: ${newAssignedUsers.join(", ")}. Comment: ${comment}`
      : `Task ${taskId} forwarded to: ${newAssignedUsers.join(", ")}`;
    await createActivityLog("Task Forwarded", req.body.forwardedBy || "unknown", logMessage);
    await taskDoc.save();
    res.json({ task: taskDoc });
  } catch (error) {
    console.error("Error forwarding task:", error);
    res.status(500).json({ message: "Error forwarding task" });
  }
});

app.post("/api/tasks/:taskId/backward", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;
    const taskDoc = await Task.findById(taskId);
    if (!taskDoc) return res.status(404).json({ message: "Task not found" });
    taskDoc.status = "backward";
    taskDoc.assignedUsers = [taskDoc.createdBy];
    await createActivityLog("Task Sent Back", req.body.sentBy || "unknown", `Task ${taskId} sent back to sender. Reason: ${reason}`);
    await taskDoc.save();
    res.json({ task: taskDoc });
  } catch (error) {
    console.error("Error sending task back:", error);
    res.status(500).json({ message: "Error sending task back" });
  }
});

app.post("/api/tasks/:taskId/remind", async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskDoc = await Task.findById(taskId);
    if (!taskDoc) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Reminder sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reminder" });
  }
});

app.get("/api/tasks/:taskId/activity", async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await ActivityLog.find({ details: new RegExp(taskId) }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Error fetching activity logs" });
  }
});

async function sendOutlookNotification(recipients, subject, content) {
  try {
    if (!recipients || !recipients.length) {
      console.log("No email recipients specified.");
      return;
    }
    const mail = {
      message: {
        subject: subject,
        body: {
          contentType: "Text",
          content: content,
        },
        toRecipients: recipients.map((email) => ({
          emailAddress: { address: email },
        })),
      },
      saveToSentItems: "true",
    };
    await client.api(`/users/${SENDER_EMAIL}/sendMail`).post(mail);
    console.log(`Email successfully sent to: ${recipients.join(", ")}`);
  } catch (err) {
    console.error("Error sending Outlook email:", err);
  }
}

app.get("/api/activity/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const logs = await ActivityLog.find({ details: new RegExp(customerId, "i") }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching customer activity logs:", error);
    res.status(500).json({ message: "Error fetching customer activity logs" });
  }
});

app.get("/api/activity/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const logs = await ActivityLog.find({ details: new RegExp(projectId, "i") }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching project activity logs:", error);
    res.status(500).json({ message: "Error fetching project activity logs" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});