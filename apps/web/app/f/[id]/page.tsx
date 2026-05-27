"use client";

import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { useGetPublicForm, useSubmitPublicForm } from "~/hooks/api/form";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch the public form data
  const { form: formDetails, isLoading, error } = useGetPublicForm(formId);
  
  // Submit Response Hook
  const { mutateAsync: submitResponseAsync } = useSubmitPublicForm();

  // Initialize dynamic form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Handle Submission
  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      await submitResponseAsync({ formId, values: data });
      setIsSubmitted(true);
      toast.success("Response submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit response.");
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Error State (Not Found, Unpublished, Expired)
  if (error || !formDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Oops!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error?.message || "This form is unavailable."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-t-4 border-t-primary">
          <CardHeader className="pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank you!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your response has been successfully recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        
        {/* Form Header */}
        <Card className="mb-6 shadow-md border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{formDetails.title}</CardTitle>
            {formDetails.description && (
              <CardDescription className="text-base mt-2 whitespace-pre-wrap">
                {formDetails.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Form Questions */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formDetails.fields.map((field) => {
            const validationRules = {
              required: field.isRequired ? "This field is required" : false,
            };

            return (
              <Card key={field.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 space-y-1">
                    <Label className="text-base font-semibold">
                      {field.label}
                      {field.isRequired && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.description && (
                      <p className="text-sm text-muted-foreground">{field.description}</p>
                    )}
                  </div>

                  {/* Render correct input based on field.type */}
                  <div className="mt-2">
                    {/* Text / Email / Number / Date */}
                    {["SHORT_TEXT", "EMAIL", "NUMBER", "DATE"].includes(field.type) && (
                      <Input
                        type={
                          field.type === "EMAIL" ? "email" :
                          field.type === "NUMBER" ? "number" :
                          field.type === "DATE" ? "date" : "text"
                        }
                        placeholder={field.placeholder || "Your answer"}
                        {...register(field.id, validationRules)}
                        className={errors[field.id] ? "border-destructive" : ""}
                      />
                    )}

                    {/* Long Text */}
                    {field.type === "LONG_TEXT" && (
                      <Textarea
                        placeholder={field.placeholder || "Your answer"}
                        {...register(field.id, validationRules)}
                        className={`min-h-[100px] resize-y ${errors[field.id] ? "border-destructive" : ""}`}
                      />
                    )}

                    {/* Radio Group */}
                    {field.type === "RADIO" && (
                      <Controller
                        name={field.id}
                        control={control}
                        rules={validationRules}
                        render={({ field: controllerField }) => (
                          <RadioGroup
                            onValueChange={controllerField.onChange}
                            defaultValue={controllerField.value}
                            className="flex flex-col space-y-2"
                          >
                            {field.options?.map((opt, idx) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <RadioGroupItem value={opt} id={`${field.id}-${idx}`} />
                                <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer">
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                    )}

                    {/* Select Dropdown */}
                    {field.type === "SINGLE_SELECT" && (
                      <Controller
                        name={field.id}
                        control={control}
                        rules={validationRules}
                        render={({ field: controllerField }) => (
                          <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                            <SelectTrigger className={errors[field.id] ? "border-destructive" : ""}>
                              <SelectValue placeholder={field.placeholder || "Select an option"} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt, idx) => (
                                <SelectItem key={idx} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}

                    {/* Checkbox / Multi-select (Arrays) */}
                    {["CHECKBOX", "MULTI_SELECT"].includes(field.type) && (
                      <Controller
                        name={field.id}
                        control={control}
                        rules={validationRules}
                        defaultValue={[]}
                        render={({ field: controllerField }) => (
                          <div className="flex flex-col space-y-3">
                            {field.options?.map((opt, idx) => {
                              const isChecked = controllerField.value.includes(opt);
                              return (
                                <div key={idx} className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`${field.id}-${idx}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...controllerField.value, opt]
                                        : controllerField.value.filter((v: string) => v !== opt);
                                      controllerField.onChange(newValue);
                                    }}
                                  />
                                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer">
                                    {opt}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                    )}
                  </div>

                  {/* Validation Error Message */}
                  {errors[field.id] && (
                    <p className="text-sm text-destructive mt-2">
                      {errors[field.id]?.message as string}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground text-sm"
              onClick={() => reset()}
            >
              Clear form
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}