
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockCustomers } from '@/data/mockData';
import Header from '@/components/Header';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
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
import { useForm } from "react-hook-form";
import { ProductType, Plant, Project } from "@/types/project";
import { toast } from "sonner";

const CreateProject = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const customer = mockCustomers.find(c => c.id === customerId);

  const form = useForm({
    defaultValues: {
      customerName: customer?.name || "",
      name: "",
      description: "",
      deliveryDateStart: "",
      deliveryDateEnd: "",
      inlineInspection: "no",
      technicalSpecsDoc: "",
      qapCriteria: "no",
      qapDocument: "",
      tenderDocument: "",
      productType: "" as ProductType,
      plant: "" as Plant,
      otherDocuments: [] as string[],
    }
  });

  const onSubmit = (data: any) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: customerId!,
      customerName: customer?.name || "",
      name: data.name,
      description: data.description,
      status: "active",
      startDate: data.deliveryDateStart,
      endDate: data.deliveryDateEnd,
      budget: 0,
      priority: "medium",
      progress: 0,
      tasks: {
        total: 0,
        completed: 0,
        pending: 0,
        stuck: 0
      },
      inlineInspection: data.inlineInspection === "yes",
      technicalSpecsDoc: data.technicalSpecsDoc,
      qapCriteria: data.qapCriteria === "yes",
      qapDocument: data.qapDocument,
      tenderDocument: data.tenderDocument,
      productType: data.productType,
      plant: data.plant,
      otherDocuments: data.otherDocuments,
      uploadedAt: new Date().toISOString()
    };

    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    localStorage.setItem("projects", JSON.stringify([...existingProjects, newProject]));
    
    toast.success("Project created successfully!");
    navigate(`/projects/${customerId}`);
  };

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
                name="technicalSpecsDoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical Specifications Document</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                    {field.value === "yes" && (
                      <FormField
                        control={form.control}
                        name="qapDocument"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>QAP Document</FormLabel>
                            <FormControl>
                              <Input type="file" {...field} required />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenderDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tender Document</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
                name="otherDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Documents (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" multiple {...field} />
                    </FormControl>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
