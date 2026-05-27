import { trpc } from '~/trpc/client';

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending, // Note: React Query v5 uses `isPending` instead of `isLoading` for mutations
    isSuccess,
    status
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.getForms.invalidate();
    }
  });

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status
  };
};

export const useGetForms = () => {
  const {
    data: forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status
  } = trpc.form.getForms.useQuery();

  return {
    forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status
  };
};

// Hook to fetch all fields for a specific form
export const useGetFields = (formId: string) => {
  const { data: fields, isLoading, error, refetch } = trpc.form.getFields.useQuery(
    { formId },
    { enabled: !!formId } // Only run if formId is provided
  );
  return { fields, isLoading, error, refetch };
};

// Hook to create a new field
export const useCreateField = (formId: string) => {
  const utils = trpc.useUtils();
  return trpc.form.createField.useMutation({
    onSuccess: async () => {
      // Invalidate the field list for this specific form
      await utils.form.getFields.invalidate({ formId });
    }
  });
};

// Hook to update an existing field
export const useUpdateField = (formId: string) => {
  const utils = trpc.useUtils();
  return trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    }
  });
};

// Hook to delete a field
export const useDeleteField = (formId: string) => {
  const utils = trpc.useUtils();
  return trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    }
  });
};

// Hook to get public form data for filling out (no auth required)
export const useGetPublicForm = (formId: string) => {
  const { 
    data: form, 
    isLoading, 
    error, 
    isFetched 
  } = trpc.form.getPublicForm.useQuery(
    { id: formId },
    { 
      enabled: !!formId,
      retry: false // Don't retry if it 404s or is unpublished
    } 
  );
  
  return { form, isLoading, error, isFetched };
};

export const useSubmitPublicForm = () => {
  return trpc.form.submitPublicForm.useMutation();
};