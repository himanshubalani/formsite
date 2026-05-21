import {randomBytes, createHmac} from 'node:crypto'
import * as JWT from 'jsonwebtoken'
import {db, eq} from '@repo/database';
import {usersTable} from '@repo/database/models/user'
import {type CreateUserWithEmailAndPasswordInputType, GenerateUserTokenPayloadType, SignInUserWithEmailAndPasswordInputType, createUserWithEmailAndPasswordInput, generateUserTokenPayload, signInUserWithEmailAndPasswordInput } from './modal'
import { UserRefreshClient } from 'google-auth-library';
import { env } from '../env';

class UserService{

	private async getUserByEmail(email: string) {
		const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
		if (!result || result.length === 0 ) return null
		return result[0]
	}

	private async generateUserToken(payload: GenerateUserTokenPayloadType) {
		const { id } = await generateUserTokenPayload.parseAsync(payload)
		const token = JWT.sign({ id }, env.JWT_SECRET)
		return { token }
	}

	private async generateHash(salt: string, password: string) {
		return createHmac('sha256', salt).update(password).digest('hex')
	}

	public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
		const { fullName, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload)

		//Check if user is alid or not
		const existingUserWithEmail = await this.getUserByEmail(email)
		if (existingUserWithEmail) throw new Error(`User with email ${email} already exists!`)
		
		//Calculate salt and hash the password
		const salt = randomBytes(16).toString('hex')
		const hash = await this.generateHash(salt, password)

		//Create User in th DB
		const userInsertResult = await db.insert(usersTable).values({fullName, email, password: hash, salt}).returning({ id: usersTable.id})

		if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) throw new Error('Something went wrong while creating User')

		const userId = userInsertResult[0]?.id

		const { token } = await this.generateUserToken({ id: userId})

		return {
			id: userId, token
		}
	}

	public async signInUserwithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
		const { email , password} = await signInUserWithEmailAndPasswordInput.parseAsync(payload)

		const existingUser = await this.getUserByEmail(email)
		if (!existingUser) throw new Error('Error: User with this email does not exist')
		
		if (!existingUser.password || !existingUser.salt) throw new Error('Error: Invalid Authentication Method. Try a different authentication method')
			const hash = await this.generateHash(existingUser.salt, password)

		if (hash !== existingUser.password) throw new Error('Invalid Email address or Password')

			const { token } = await this.generateUserToken({id: existingUser.id})
			return{ id: existingUser.id, token } 
	}

}

export default UserService