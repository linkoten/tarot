import { prisma } from "@/lib/db";

export const addUserToDatabase = async (
  clerkUserId: string,
  name: string,
  email: string,
  image: string
) => {
  try {
    console.log("data", clerkUserId, name, email);
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        name,
        email,
        image,
      },
      create: {
        clerkUserId,
        name,
        email,
        image,
      },
    });
    return user;
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la création de lutilisateur",
      error
    );
    throw error;
  }
};

export const getUserFromDatabase = async (clerkUserId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });
    return user;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur de la base de données:",
      error
    );
    throw error;
  }
};

export async function getUserByClerkId(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
