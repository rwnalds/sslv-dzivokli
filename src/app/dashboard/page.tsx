import { desc, eq, inArray } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "src/auth";
import { db, foundListings, searchCriteria } from "src/db/schema";
import { ListingsList } from "./listings-list";
import { SearchCriteriaList } from "./search-criteria-list";
import { SearchForm } from "./search-form";

export const metadata: Metadata = {
  title: "Dashboard - SS.lv Apartment Finder",
  description: "Manage your apartment search criteria and view found listings.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Get user's search criteria and latest listings
  const userCriteria = await db
    .select()
    .from(searchCriteria)
    .where(eq(searchCriteria.userId, session.user.id))
    .orderBy(desc(searchCriteria.createdAt));

  const latestListings = await db
    .select()
    .from(foundListings)
    .where(
      inArray(
        foundListings.criteriaId,
        userCriteria.map((c) => c.id)
      )
    )
    .orderBy(desc(foundListings.foundAt))
    .limit(50);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Apartment Search Dashboard</h1>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8">
        {/* Search Criteria Section */}
        <div className="space-y-6">
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Search Criteria</h2>
              <SearchForm userId={session.user.id} />
            </div>
          </div>

          {/* Active Search Criteria List */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title mb-4">Active Searches</h2>
              <SearchCriteriaList criteria={userCriteria} />
            </div>
          </div>
        </div>

        {/* Found Listings Section */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Latest Listings</h2>
            <ListingsList listings={latestListings} />
          </div>
        </div>
      </div>
    </div>
  );
}
