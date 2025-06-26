import { z } from 'zod'


export const usernameValidation = z
.string()
.min(2,"Username must be atleast 2 characters")
.max(20,"Username must be no more than 20 characters")


export const signupSchema = z.object({
    username: usernameValidation,
    email:z.string().email({message:"Invalid Email address"}),
    password: z.string().min(6,{message:"password must be of atleast 6 characters"})
})


