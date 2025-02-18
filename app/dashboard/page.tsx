import React from "react";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { addUserToDatabase, getUserFromDatabase } from "@/services/userService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvitationListener } from "../components/InvitationListener";
import CreateGameButtons from "../components/CreateGameButton";

export default async function DashboardPage() {
  const { userId } = await auth();

  console.log(userId);
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  // Ajoutez l'utilisateur à la base de données
  if (userId && user) {
    const fullName = user.firstName + " " + user.lastName || "";
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";
    await addUserToDatabase(userId, fullName, email, image);
  }

  const data = await getUserFromDatabase(userId);

  if (!data) return;
  return (
    <>
      <section className="w-full h-screen flex items-center flex-col pt-6">
        <div className="mb-4 border p-3 rounded-md">
          <Image
            src={data?.image as string}
            alt={data?.name as string}
            width={100}
            height={100}
            className="rounded-full"
          />
          <h1> Bienvenue {data?.name}</h1>
          <p>{data?.email}</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-3xl font-bold mb-6">Créer une partie de Tarot</h1>
          <CreateGameButtons />

          <Link href="/dashboard">
            <Button variant="outline">Retour au tableau de bord</Button>
          </Link>
          {/* Add the SocketTest component */}
          <div className="mt-8 w-full max-w-md"></div>
        </div>
      </section>
      <InvitationListener userId={data.id} userName={data.name} />
    </>
  );
}
