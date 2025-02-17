import { Metadata } from "next";
import { auth } from "src/auth";
import { ListingsList } from "./listings-list";
import { SearchCriteriaList } from "./search-criteria-list";
import { SearchForm } from "./search-form";

import { prisma } from "@/utils/get-prisma";
import Link from "next/link";
import { NotificationButton } from "../components/NotificationButton";
import RefreshButton from "./refresh";

export const metadata: Metadata = {
  title: "Meklēšana | SSpots",
  description:
    "Pārvaldi savus meklēšanas kritērijus un skati atrastos sludinājumus.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;
  const hasPaid = !!session?.user?.hasPaid;

  // For authenticated users, get their criteria and listings
  const userCriteria = isAuthenticated
    ? await prisma.searchCriteria.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const latestListings = isAuthenticated
    ? await prisma.foundListing.findMany({
        where: {
          criteriaId: {
            in: userCriteria.map((c) => c.id),
          },
        },
        orderBy: {
          foundAt: "desc",
        },
        take: 50,
      })
    : [];

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Baigi noderīgs rīks?{" "}
      <Link
        href="https://buymeacoffee.com/devkey"
        className="underline text-blue-500"
        target="_blank"
      >
        Nopērc man kafij
      </Link> */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-4 sm:mb-8">Dzīvokļu Meklēšana</h1>
        {isAuthenticated && <NotificationButton />}
      </div>
      <div className="grid lg:grid-cols-[350px_1fr] gap-4 sm:gap-8">
        {/* Search Criteria Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card bg-base-200">
            <div className="card-body p-3 sm:p-4">
              <h2 className="card-title">Meklēšanas Kritēriji</h2>
              <SearchForm />
              {!hasPaid && (
                <div className="alert alert-info mt-4">
                  <p>
                    Lai saglabātu meklēšanas kritērijus un saņemtu paziņojumus,
                    nepieciešams{" "}
                    {isAuthenticated
                      ? "veikt maksājumu"
                      : "pieslēgties un veikt maksājumu"}
                    .
                  </p>
                  <Link href="/pricing" className="btn btn-primary btn-sm mt-2">
                    {isAuthenticated ? "Veikt Maksājumu" : "Pieslēgties"}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active Search Criteria List - only show for paid users */}
          {hasPaid && (
            <div className="card bg-base-200">
              <div className="card-body p-3 sm:p-4">
                <h2 className="card-title mb-3 sm:mb-4">Aktīvie Meklējumi</h2>
                <SearchCriteriaList criteria={userCriteria} />
              </div>
            </div>
          )}
        </div>

        {/* Found Listings Section - only show for paid users */}
        {hasPaid ? (
          <div className="card bg-base-200">
            <div className="card-body p-3 sm:p-4">
              <div className="flex justify-between mb-3 sm:mb-4 items-center">
                <h2 className="card-title">Jaunākie Sludinājumi</h2>
                <RefreshButton />
              </div>

              <ListingsList
                listings={latestListings}
                searchCriteria={userCriteria}
              />
            </div>
          </div>
        ) : (
          <div className="card bg-base-200">
            <div className="card-body p-3 sm:p-4">
              <h2 className="card-title mb-4">Kā Tas Strādā?</h2>
              <div className="space-y-4">
                <p>1. Izveido meklēšanas kritērijus ar savām prasībām</p>
                <p>
                  2. Saņem tūlītējus paziņojumus, kad parādās jauni sludinājumi
                </p>
                <p>3. Esi pirmais, kas uzzina par izdevīgiem piedāvājumiem</p>
                <div className="alert alert-info mt-6">
                  <p>
                    Lai sāktu saņemt paziņojumus, nepieciešams{" "}
                    {isAuthenticated
                      ? "veikt maksājumu"
                      : "pieslēgties un veikt maksājumu"}
                    .
                  </p>
                  <Link href="/pricing" className="btn btn-primary btn-sm mt-2">
                    {isAuthenticated ? "Veikt Maksājumu" : "Pieslēgties"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
