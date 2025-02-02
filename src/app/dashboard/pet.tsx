import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { revalidatePath } from "next/cache";
import { auth } from "src/auth";
import * as schema from "src/db/schema";
import { pets } from "src/db/schema";
import { PetNameForm } from "./_components/pet-name-form";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export async function Pet() {
  const session = await auth();
  if (!session?.user?.id) return;

  const pet = await db.query.pets.findFirst({
    where: eq(pets.ownerId, session?.user?.id),
  });

  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 bg-white card items-center">
      <div className="rounded-full w-16 h-16 text-3xl bg-base-200 flex items-center justify-center">
        🐕
      </div>
      <form
        className="w-[90%]"
        action={async (formData: FormData) => {
          "use server";
          const name = formData.get("name");
          if (!pet) {
            await db.insert(pets).values({
              ownerId: session.user?.id ?? "",
              name: name?.toString(),
            });
          } else {
            await db.update(pets).set({ name: name?.toString() });
          }
          revalidatePath("/dashboard");
        }}
      >
        <PetNameForm pet={pet} userId={session.user.id} />
      </form>
    </div>
  );
}
