import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request:Request) {
    await dbConnect()

    const{username,content} = await request.json()

    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json(
                { 
                    success: false,
                    message: 'User not found'
                },
                { status: 404 }
              );
        }

        if(!user.isAcceptingMessages){
            return Response.json(
                { 
                    success: false,
                    message: 'User is not accepting'
                },
                { status: 403 }
            );
        }


        const newMessage = {content, createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()


        return Response.json(
            { 
                success: true,
                message: 'Message sent successfully'
            },
            { status: 404 }
          );


    } catch (error) {
        console.error('Error adding messages', error);
        return Response.json(
        { 
            message: 'Error adding messages',
            success: false 
        },
          { status: 401 }
        );
    }
}