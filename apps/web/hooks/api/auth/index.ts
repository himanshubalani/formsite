import {trpc} from '~/trpc/client'
import { signInUserWithEmailAndPasswordInput } from '../../../../../packages/services/user/modal';

export const useSignup = () => {
	const {mutateAsync: createUserWithEmailAndPasswordAsync,
		mutate: createUserWithEmailAndPassword,
		error,
		failureCount,
		isError,
		isIdle,
		isSuccess,
		status
	} = trpc.auth.createUserWithEmailAndPassword.useMutation();

	return {
		createUserWithEmailAndPasswordAsync,
		createUserWithEmailAndPassword,
		error,
		failureCount,
		isError,
		isIdle,
		isSuccess,
		status
	}
}

export const useSignIn = () => {
		const {mutateAsync: signInUserWithEmailAndPasswordAsync,
		mutate: signInUserWithEmailAndPassword,
		error,
		failureCount,
		isError,
		isIdle,
		isSuccess,
		status
	} = trpc.auth.signInUserWithEmailAndPassword.useMutation();

	return {
		signInUserWithEmailAndPasswordAsync,
		signInUserWithEmailAndPassword,
		error,
		failureCount,
		isError,
		isIdle,
		isSuccess,
		status
	}

}