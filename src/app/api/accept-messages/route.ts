import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request:Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user = session?.user
    if (!session || !session.user) {
        return Response.json({
            success:false,
            message:"Not authenticated"
        },{status:401})
    }
    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages:acceptMessages},
            {new:true}
        )
        if(!updatedUser){
            return Response.json(
                {
                    sucsess:false,
                    message:"Failed to update user status to accept messages"
                },
                {
                    status:401
                }
            )
        }
        return Response.json(
            {
                sucsess:true,
                message:"Message acceptance status updated succesfully",
                updatedUser
            },
            {
                status:200
            }
        )
    } catch (error) {
        console.log("Failed to update user status to accept messages");
        return Response.json(
            {
                sucsess:false,
                message:"Failed to update user status to accept messages"
            },
            {
                status:500
            }
        )
    }
}


export async function GET(request:Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user = session?.user
    if (!session || !session.user) {
        return Response.json({
            success:false,
            message:"Not authenticated"
        },{status:401})
    }
    const userId = user._id
    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json(
                {
                    sucsess:false,
                    message:"User not found"
                },
                {
                    status:404
                }
            )
        }
    
        return Response.json(
            {
                sucsess:true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {
                status:200
            }
        )   
    } catch (error) {
        console.log("Error in gettin accept message status");
        return Response.json(
            {
                sucsess:false,
                message:"Error in gettin accept message status"
            },
            {
                status:500
            }
        )
    }
}