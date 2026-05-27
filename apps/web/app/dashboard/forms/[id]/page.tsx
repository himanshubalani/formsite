"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit2, Loader2, ArrowLeft, 
  Type, AlignLeft, Hash, AtSign, Calendar, 
  CheckSquare, CircleDot, List, ListChecks
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { 
  useGetFields, useCreateField, 
  useUpdateField, useDeleteField, useGetForms 
} from "~/hooks/api/form";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter
} from "~/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";

const FIELD_TYPES = [
  { type: "SHORT_TEXT", label: "Short Text" },
  { type: "LONG_TEXT", label: "Long Text" },
  { type: "NUMBER", label: "Number" },
  { type: "EMAIL", label: "Email" },
  { type: "DATE", label: "Date" },
  { type: "SINGLE_SELECT", label: "Dropdown" },
  { type: "MULTI_SELECT", label: "Multi-Select" },
  { type: "RADIO", label: "Radio Buttons" },
  { type: "CHECKBOX", label: "Checkboxes" },
] as const;

type FieldType = typeof FIELD_TYPES[number]["type"];

export default function FormBuilderPage() {
  const params = useParams();
  const formId = params.id as string;
  const router = useRouter();

  // API Hooks
  const { forms, isLoading: isLoadingForms } = useGetForms();
  const { fields, isLoading: isLoadingFields } = useGetFields(formId);
  const { mutateAsync: createField, isPending: isCreating } = useCreateField(formId);
  const { mutateAsync: updateField, isPending: isUpdating } = useUpdateField(formId);
  const { mutateAsync: deleteField, isPending: isDeleting } = useDeleteField(formId);

  const formDetails = forms?.find((f) => f.id === formId);

  // --- Add Field State ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FieldType>("SHORT_TEXT");
  const [newDescription, setNewDescription] = useState("");
  const [newPlaceholder, setNewPlaceholder] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState(""); // For select/radio types

  // --- Edit Field State ---
  const [editingField, setEditingField] = useState<any>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editRequired, setEditRequired] = useState(false);
  const [editOptions, setEditOptions] = useState("");

  const resetAddForm = () => {
    setNewLabel("");
    setNewType("SHORT_TEXT");
    setNewDescription("");
    setNewPlaceholder("");
    setNewRequired(false);
    setNewOptions("");
  };

  const handleAddField = async () => {
    if (!newLabel.trim()) {
      toast.error("Label is required");
      return;
    }

    try {
      const nextIndex = fields && fields.length > 0 
        ? Math.max(...fields.map(f => Number(f.index))) + 1 
        : 1;

      await createField({
        formId,
        type: newType,
        label: newLabel,
        description: newDescription || null,
        placeholder: newPlaceholder || null,
        isRequired: newRequired,
        index: nextIndex,
        options: newOptions ? newOptions.split(",").map(o => o.trim()) : null
      });

      toast.success("Field added successfully");
      setIsAddOpen(false);
      resetAddForm();
    } catch (error) {
      toast.error("Failed to add field");
    }
  };

  const openEditDialog = (field: any) => {
    setEditingField(field);
    setEditLabel(field.label);
    setEditRequired(field.isRequired);
    setEditOptions(field.options ? field.options.join(", ") : "");
  };

  const handleUpdateField = async () => {
    if (!editingField) return;
    try {
      await updateField({
        id: editingField.id,
        label: editLabel,
        isRequired: editRequired,
        options: editOptions ? editOptions.split(",").map(s => s.trim()) : null,
      });
      toast.success("Field updated");
      setEditingField(null);
    } catch (error) {
      toast.error("Failed to update field");
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    try {
      await deleteField({ id });
      toast.success("Field deleted");
      if (editingField?.id === id) setEditingField(null);
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  if (isLoadingForms || isLoadingFields) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!formDetails) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <Button className="mt-4" onClick={() => router.push("/dashboard/forms")}>
          Go back to forms
        </Button>
      </div>
    );
  }

  const needsOptions = ['SINGLE_SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'].includes(newType);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-muted/10">
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Builder Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/forms">
                <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{formDetails.title}</h1>
                <Badge variant={formDetails.isPublished ? "default" : "secondary"}>
                  {formDetails.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
            {/* Top Add Field Button */}
            {fields && fields.length > 0 && (
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
            )}
          </div>

          {/* Render Fields */}
          {fields?.length === 0 ? (
            <Card className="border-dashed shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <List className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Your form is empty</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
                  Start building your form by adding your first question or field.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Field
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields?.map((field) => (
                <Card key={field.id} className="relative group hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-medium flex items-center">
                        {field.label} {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {FIELD_TYPES.find(f => f.type === field.type)?.label || field.type}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(field)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteField(field.id)} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {['SHORT_TEXT', 'NUMBER', 'EMAIL', 'DATE'].includes(field.type) && (
                      <Input disabled placeholder={field.placeholder || "User input goes here..."} />
                    )}
                    {field.type === 'LONG_TEXT' && (
                      <Textarea disabled placeholder={field.placeholder || "Long answer text..."} />
                    )}
                    {['SINGLE_SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'].includes(field.type) && (
                      <div className="text-sm border rounded-md p-2 bg-muted/20">
                        <span className="font-semibold text-xs text-muted-foreground mb-2 block">Options:</span>
                        <ul className="list-disc list-inside">
                          {field.options?.map((opt: string, idx: number) => <li key={idx}>{opt}</li>)}
                        </ul>
                      </div>
                    )}
                    {field.description && (
                      <p className="text-sm text-muted-foreground mt-2">{field.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Bottom Add Field Button */}
              <div className="flex justify-center pt-6">
                <Button variant="secondary" onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Another Field
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD FIELD DIALOG --- */}
      <Dialog 
        open={isAddOpen} 
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add field</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label>Label</Label>
              <Input 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
                placeholder="E.g. Location" 
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newType} onValueChange={(val) => setNewType(val as FieldType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a field type" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft.type} value={ft.type}>{ft.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options (Conditionally Rendered) */}
            {needsOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <Textarea 
                  value={newOptions} 
                  onChange={(e) => setNewOptions(e.target.value)} 
                  placeholder="Option 1, Option 2, Option 3 (comma separated)"
                />
                <p className="text-xs text-muted-foreground">Separate options with commas.</p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={newDescription} 
                onChange={(e) => setNewDescription(e.target.value)} 
                placeholder="Optional description..."
                className="resize-none" 
              />
              <p className="text-xs text-muted-foreground">
                Helper text shown below the field (optional)
              </p>
            </div>

            {/* Placeholder */}
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input 
                value={newPlaceholder} 
                onChange={(e) => setNewPlaceholder(e.target.value)} 
                placeholder="E.g. Where do you live?" 
              />
            </div>

            {/* Required Field Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="required-checkbox" 
                checked={newRequired} 
                onCheckedChange={(checked) => setNewRequired(checked as boolean)} 
              />
              <Label htmlFor="required-checkbox" className="font-normal cursor-pointer">
                Required field
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleAddField} disabled={isCreating}>
              {isCreating ? "Adding..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- EDIT FIELD DIALOG (Remains largely the same) --- */}
      <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="space-y-0.5">
                <Label>Required</Label>
                <p className="text-sm text-muted-foreground">Make this field mandatory.</p>
              </div>
              <Switch checked={editRequired} onCheckedChange={setEditRequired} />
            </div>

            {['SINGLE_SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'].includes(editingField?.type) && (
              <div className="space-y-2">
                <Label>Options (Comma separated)</Label>
                <Textarea 
                  value={editOptions} 
                  onChange={(e) => setEditOptions(e.target.value)} 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleUpdateField} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}