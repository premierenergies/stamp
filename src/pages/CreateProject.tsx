// CreateProject.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, FormProvider } from "react-hook-form";
import { ProductType, Plant, Project } from "@/types/project";
import { toast } from "sonner";

const CreateProject = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local state for file inputs – do NOT register these with react-hook-form
  const [technicalSpecsFile, setTechnicalSpecsFile] = useState<File | null>(null);
  const [qapFile, setQapFile] = useState<File | null>(null);
  const [tenderFile, setTenderFile] = useState<File | null>(null);
  const [otherFiles, setOtherFiles] = useState<FileList | null>(null);

  // Only include non‐file fields in the form defaults.
  const methods = useForm({
    defaultValues: {
      customerName: "",
      name: "",
      description: "",
      deliveryDateStart: "",
      deliveryDateEnd: "",
      inlineInspection: "no",
      qapCriteria: "no",
      productType: "" as ProductType,
      plant: "" as Plant,
    },
  });
  const { control, reset, handleSubmit, watch } = methods;

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/customers/${customerId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch customer");
        }
        const data = await res.json();
        setCustomer(data.customer);
        reset({ customerName: data.customer.name });
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId, reset]);

  const onSubmit = async (data: any) => {
    // Create a FormData instance
    const formData = new FormData();
    formData.append("customerId", customerId!);
    formData.append("customerName", customer?.name || "");
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("startDate", data.deliveryDateStart);
    formData.append("endDate", data.deliveryDateEnd);
    formData.append("inlineInspection", data.inlineInspection);
    formData.append("qapCriteria", data.qapCriteria);
    formData.append("productType", data.productType);
    formData.append("plant", data.plant);
    // Append file inputs if available – these values now come from local state
    if (technicalSpecsFile) {
      formData.append("technicalSpecsDoc", technicalSpecsFile);
    }
    if (data.qapCriteria === "yes" && qapFile) {
      formData.append("qapDocument", qapFile);
    }
    if (tenderFile) {
      formData.append("tenderDocument", tenderFile);
    }
    if (otherFiles) {
      Array.from(otherFiles).forEach(file => {
        formData.append("otherDocuments", file);
      });
    }
    // Append other project fields
    formData.append("status", "active");
    formData.append("budget", "0");
    formData.append("priority", "medium");
    formData.append("progress", "0");
    formData.append(
      "tasks",
      JSON.stringify({ total: 0, completed: 0, pending: 0, stuck: 0 })
    );
    formData.append("uploadedAt", new Date().toISOString());
    formData.append("createdBy", customerId!);

    try {
      const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to create project");
      }
      toast.success("Project created successfully!");
      navigate(`/projects/${customerId}`);
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast.error(err.message || "Error creating project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled value={customer.name} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} required />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="deliveryDateStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="deliveryDateEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="inlineInspection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inline Inspection</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select yes or no" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                {/* Use uncontrolled file inputs for documents */}
                <div>
                  <FormLabel>Technical Specifications Document</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setTechnicalSpecsFile(e.target.files ? e.target.files[0] : null)
                    }
                    required
                  />
                </div>
                {watch("qapCriteria") === "yes" && (
                  <div>
                    <FormLabel>QAP Document</FormLabel>
                    <Input
                      type="file"
                      onChange={(e) =>
                        setQapFile(e.target.files ? e.target.files[0] : null)
                      }
                      required
                    />
                  </div>
                )}
                <div>
                  <FormLabel>Tender Document</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setTenderFile(e.target.files ? e.target.files[0] : null)
                    }
                    required
                  />
                </div>
                <div>
                  <FormLabel>Other Documents (Optional)</FormLabel>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setOtherFiles(e.target.files)}
                  />
                </div>
                <FormField
                  control={control}
                  name="qapCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QAP Criteria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select yes or no" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCE">PERCE</SelectItem>
                          <SelectItem value="TOPCON M10">TOPCON M10</SelectItem>
                          <SelectItem value="TOPCON G12R">TOPCON G12R</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="plant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PEPPL">PEPPL</SelectItem>
                          <SelectItem value="PEIPL">PEIPL</SelectItem>
                          <SelectItem value="PEGEPL 1">PEGEPL 1</SelectItem>
                          <SelectItem value="PEGEPL 2">PEGEPL 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Project
                </button>
              </form>
            </FormProvider>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
