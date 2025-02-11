import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Your Pet Management Settings",
  description:
    "Manage your pet profiles, notification preferences, and veterinary connections.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  return <div>page</div>;
}
