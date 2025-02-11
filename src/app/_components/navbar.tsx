import { PWAInstallButton } from "@/components/pwa-install-button";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "../../auth";
import { UserButton } from "./user-button";

export async function Navbar() {
  const session = await auth();

  return (
    <div className="bg-base-100 border-b">
      <nav className="navbar max-w-6xl mx-auto px-4 sm:px-6">
        <div className="navbar-start flex items-center gap-2">
          <Image src="/icon.svg" alt="Logo" width={32} height={32} />
          <Link href="/" className="text-xl font-bold">
            SSpots
          </Link>
        </div>
        <div className="navbar-end gap-2">
          <PWAInstallButton />
          <UserButton user={session?.user as User} />
        </div>
      </nav>
    </div>
  );
}
