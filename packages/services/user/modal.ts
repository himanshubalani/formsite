import { z } from 'zod';

export const createUserWithEmailAndPasswordInput = z.object({
	fullName: z.string().describe('Full name of the user'),
	email: z.email().describe('Email of the user'),
	//TODO: Add Regex here in password
	password: z.string().describe('Password set by the user')
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>

export const generateUserTokenPayload = z.object({
	id: z.string().describe('UUID of the User'),
})

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>