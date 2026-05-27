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