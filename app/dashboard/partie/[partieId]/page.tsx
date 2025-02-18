import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TableDeJeu from "@/app/components/TableDeJeu";
import { getOnlineUsers, getPartieById } from "@/lib/partie/partie";
import { getUserByClerkId } from "@/services/userService";

export default async function PartiePage({
  params,
}: {
  params: { partieId: number };
}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  try {
    const user = await getUserByClerkId(clerkUserId);
    const partie = await getPartieById(Number(params.partieId));

    console.log("la partie", partie);

    if (!partie) {
      redirect("/dashboard");
    }

    const onlineUsers = await getOnlineUsers();

    return (
      <TableDeJeu
        partie={partie}
        currentUserId={user.id}
        onlineUsers={onlineUsers}
      />
    );
  } catch (error) {
    console.error("Error fetching user or partie:", error);
    redirect("/error");
  }
}
