import {z} from 'zod'

export const createUserWithEmailAndPasswordInputModel = z.object({
	fullName: z.string().describe('Name of the User'),
	email: z.email().describe('Email of the User'),
	password: z.string().describe('Password set by the user')
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
	id: z.string().describe('ID of the User created'),
})

export const signInUserWithEmailAndPasswordInputModel = z.object({
	email: z.email().describe('Email of the User'),
	password: z.string().describe('Password set by the user')
})

export const signInUserWithEmailAndPasswordOutputModel = z.object({
	id: z.string().describe('ID of the User created'),
})
