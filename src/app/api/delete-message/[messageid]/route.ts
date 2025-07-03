import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
    const messageId = request.nextUrl.pathname.split("/").pop();

    if (!messageId) {
        return new Response(
            JSON.stringify({ success: false, message: "Message ID is missing" }),
            { status: 400 }
        );
    }

    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user) {
        return new Response(
            JSON.stringify({ success: false, message: "Not authenticated" }),
            { status: 401 }
        );
    }

    try {
        const updateResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount === 0) {
            return new Response(
                JSON.stringify({
                    message: "Message not found or already deleted",
                    success: false,
                }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "Message deleted", success: true }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting message:", error);
        return new Response(
            JSON.stringify({ message: "Error deleting message", success: false }),
            { status: 500 }
        );
    }
}
