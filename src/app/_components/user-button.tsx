import { signIn, signOut } from "@/auth";
import { User } from "@prisma/client";
import Image from "next/image";

export function UserButton({ user }: { user?: User }) {
  return (
    <>
      {user ? (
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 relative rounded-full">
              <Image
                alt="Tailwind CSS Navbar component"
                src={user.image || ""}
                sizes="30x30"
                fill
              />
            </div>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <div className="font-bold px-3 py-2">{user.name}</div>
            <li>
              <button
                onClick={async () => {
                  "use server";
                  await signOut();
                }}
              >
                Iziet
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button className="btn btn-outline">Ieiet</button>
        </form>
      )}
    </>
  );
}
