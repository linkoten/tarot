import React from "react";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ComponentUseAuth from "../components/ComponentUseAuth";
import ComponentUseUser from "../components/ComponentUseUser";
import { addUserToDatabase, getUserFromDatabase } from "@/services/userService";

export default async function page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (userId && user) {
    const fullname = `${user.firstName} ${user.lastName} ` || "";
    const email = user.emailAddresses[0]?.emailAddress || "";
    const image = user.imageUrl || "";
    await addUserToDatabase(userId, fullname, email, image);
  }

  const data = await getUserFromDatabase(userId);

  return (
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

      <ComponentUseAuth />
      <ComponentUseUser />
    </section>
  );
}
