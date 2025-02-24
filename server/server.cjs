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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
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

const USERS = [
  { id: 1, name: "Praful", email: "praful@example.com", password: "praful", role: "admin" },
  { id: 2, name: "Sales User", email: "sales@example.com", password: "sales", role: "sales" },
  { id: 3, name: "User 1", email: "user1@example.com", password: "password", role: "user" },
  { id: 20, name: "nav", email: "aarnav.singh@premierenergies.com", password: "nav", role: "user" },
];

// ----------------------
// Customer Schema – industry is now optional
// ----------------------
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: false },
  projects: { type: Array, default: [] },
  activeProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Customer = mongoose.model("Customer", customerSchema);

// GET single customer by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        industry: customer.industry,
        projects: customer.projects,
        activeProjects: customer.activeProjects,
        completedProjects: customer.completedProjects,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer" });
  }
});

// GET all customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(
      customers.map(c => ({
        id: c._id.toString(),
        name: c.name,
        industry: c.industry,
        projects: c.projects,
        activeProjects: c.activeProjects,
        completedProjects: c.completedProjects,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

// POST /api/customers – create new customer
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

// ----------------------
// Document Schema
// ----------------------
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

// ----------------------
// Task Response Schema
// ----------------------
const taskResponseSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  status: { type: String, enum: ["approved", "rejected"] },
  reason: String,
  fileUrl: String,
  late: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

// ----------------------
// Task Schema
// ----------------------
const taskSchema = new mongoose.Schema({
  projectName: String,
  documentId: String,
  documentName: String,
  documentUrl: String,
  description: String,
  assignedUsers: [String],
  responses: [taskResponseSchema],
  attachments: [{ name: String, url: String }],
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
  timeline: Date,
  isLate: { type: Boolean, default: false },
  finalSignOff: {
    users: [String],
    comments: String,
    timestamp: Date,
  },
});
const Task = mongoose.model("Task", taskSchema);

// ----------------------
// Activity Log Schema
// ----------------------
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

// ----------------------
// Endpoints
// ----------------------

// POST /api/login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// GET /api/users
app.get("/api/users", (req, res) => {
  const usersWithoutPasswords = USERS.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPasswords);
});

// GET /api/documents
app.get("/api/documents", async (req, res) => {
  try {
    let query = {};
    if (req.query.uploadedBy) query.uploadedBy = req.query.uploadedBy;
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

// PUT /api/documents/:docId – update document (Sales editing)
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

// POST /api/documents – create document (Sales submission)
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

// POST /api/projects – create project (new endpoint)
app.post("/api/projects", async (req, res) => {
  try {
    const {
      id,
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
      technicalSpecsDoc,
      qapCriteria,
      qapDocument,
      tenderDocument,
      productType,
      plant,
      otherDocuments,
      uploadedAt,
      createdBy,
    } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    const newProject = {
      id,
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
      technicalSpecsDoc,
      qapCriteria,
      qapDocument,
      tenderDocument,
      productType,
      plant,
      otherDocuments,
      uploadedAt,
    };
    customer.projects.push(newProject);
    await customer.save();
    await createActivityLog("Project Creation", createdBy || "unknown", `Project ${newProject.name} created for customer ${customer.name}.`);
    res.status(201).json({ project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

// ----------------------
// Outlook Notification Function
// ----------------------
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
