"use client";

import { useParams } from "next/navigation";
import { Loader2, Inbox } from "lucide-react";
import { format } from "date-fns";

import { useGetFields, useGetFormSubmissions } from "~/hooks/api/form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function FormSubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;

  // 1. Fetch fields to act as table headers
  const { fields, isLoading: isLoadingFields } = useGetFields(formId);
  
  // 2. Fetch submissions to act as table rows
  const { submissions, isLoading: isLoadingSubmissions } = useGetFormSubmissions(formId);

  const isLoading = isLoadingFields || isLoadingSubmissions;

  // Helper function to extract and format a specific field's value from the JSON payload
  const getFieldValue = (submissionValues: any[] | null | undefined, fieldId: string) => {
    if (!submissionValues) return "-";
    
    const fieldData = submissionValues.find((v) => v.formFieldId === fieldId);
    if (!fieldData || fieldData.value === null || fieldData.value === undefined) return "-";

    // Arrays (like Checkbox or Multi-select) get joined into a comma-separated string
    if (Array.isArray(fieldData.value)) {
      return fieldData.value.join(", ");
    }

    return String(fieldData.value);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze responses submitted to this form.
          </p>
        </div>
        <Link href={`/dashboard/forms/${formId}`}>
          <Button variant="outline">Back to Form Editor</Button>
        </Link>
      </div>

      {!fields || fields.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No fields found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              This form doesn't have any fields yet. Add some fields before collecting responses.
            </p>
            <Link href={`/dashboard/forms/${formId}`} className="mt-4">
              <Button>Edit Form Fields</Button>
            </Link>
          </CardContent>
        </Card>
      ) : !submissions || submissions.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No submissions yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven't received any responses to this form. Share the link to start collecting data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Responses ({submissions.length})</CardTitle>
            <CardDescription>Latest submissions are shown first.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* The wrapper allows horizontal scrolling if there are many fields */}
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px] bg-muted/50 sticky left-0 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                      Submission Date
                    </TableHead>
                    {fields.map((field) => (
                      <TableHead key={field.id} className="min-w-[150px] max-w-[300px]">
                        {field.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="text-muted-foreground bg-muted/20 sticky left-0 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                        {format(new Date(submission.createdAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      
                      {fields.map((field) => (
                        <TableCell 
                          key={`${submission.id}-${field.id}`} 
                          className="max-w-[300px] truncate"
                          title={getFieldValue(submission.values, field.id)}
                        >
                          {getFieldValue(submission.values, field.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}