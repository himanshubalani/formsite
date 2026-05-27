"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useCreateForm } from "~/hooks/api/form";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// 1. Zod schema for frontend form validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).default("PUBLIC"),
});

export default function FormsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // 2. Initialize our tRPC hook
  const { createFormAsync, isPending } = useCreateForm();

  // 3. Initialize React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "PUBLIC",
    },
  });

  // 4. Handle Submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newForm = await createFormAsync(values);
      toast.success("Form created successfully!");
      setOpen(false);
      form.reset();
      
      // Optional: Redirect user to the form builder page immediately
      // router.push(`/dashboard/forms/${newForm.id}/edit`);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create form");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground mt-1">
            Manage, create, and view analytics for your forms.
          </p>
        </div>

        {/* Create Form Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new form</DialogTitle>
              <DialogDescription>
                Give your form a title and description. You can add fields dynamically later.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
                
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Startup Registration Form" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What is this form about?" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visibility Field */}
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public (Explore Page)</SelectItem>
                          <SelectItem value="UNLISTED">Unlisted (Direct Link Only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Unlisted forms will not appear in the public galleries.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Form"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State Placeholder (You can replace this with a grid of forms later) */}
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 mt-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Plus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            No forms created yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Get started by creating a new form. You can add dynamic fields, set rules, and start collecting responses.
          </p>
          <Button onClick={() => setOpen(true)}>Create your first form</Button>
        </div>
      </div>
    </div>
  );
}