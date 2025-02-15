"use client";

import { FoundListing, SearchCriteria } from "@prisma/client";
import { ExternalLink, Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useListings } from "../../../hooks/useListings";
import { toggleFavorite } from "./actions";

interface ListingsListProps {
  listings: FoundListing[];
  searchCriteria: SearchCriteria[];
}

export function ListingsList({
  listings: initialListings,
  searchCriteria,
}: ListingsListProps) {
  const router = useRouter();
  const { listings: baseListings, isRefreshing } = useListings(initialListings);
  const [optimisticFavorites, setOptimisticFavorites] = useState<Set<number>>(
    () => new Set(initialListings.filter((l) => l.isFavorite).map((l) => l.id))
  );

  // Merge base listings with optimistic favorites
  const listings = baseListings.map((listing) => ({
    ...listing,
    isFavorite: optimisticFavorites.has(listing.id),
  }));

  async function handleFavoriteClick(listingId: number) {
    // Optimistically update the UI
    setOptimisticFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    const promise = toggleFavorite(listingId);

    toast.promise(promise, {
      loading: "Mainām favorītu statusu...",
      success: (data) => {
        return data.message || "Favorītu status mainīts!";
      },
      error: (err) => {
        // Revert optimistic update on error
        setOptimisticFavorites((prev) => {
          const next = new Set(prev);
          if (next.has(listingId)) {
            next.delete(listingId);
          } else {
            next.add(listingId);
          }
          return next;
        });
        return err.error || "Neizdevās mainīt favorītu statusu";
      },
    });
  }

  function getSearchCriteriaName(criteriaId: number) {
    const criteria = searchCriteria.find((c) => c.id === criteriaId);
    if (!criteria) return null;

    return criteria.region;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">
          Pagaidām nav atrasts neviens sludinājums. Mēs paziņosim, kad
          parādīsies jauni dzīvokļi, kas atbilst taviem kritērijiem!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRefreshing && (
        <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-base-content/70">
              Atjaunojam sludinājumus...
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {listing.imageUrl && (
                  <div className="relative w-full sm:w-32 h-48 sm:h-24 flex-shrink-0">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{listing.title}</h3>
                    {getSearchCriteriaName(listing.criteriaId) && (
                      <div className="badge badge-primary badge-sm">
                        {getSearchCriteriaName(listing.criteriaId)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-base-content/70">
                    <p>
                      <strong>Cena:</strong> {listing.price}€
                    </p>
                    <p>
                      <strong>Istabas:</strong> {listing.rooms}
                    </p>
                    <p>
                      <strong>Platība:</strong> {listing.area} m²
                    </p>
                    <p>
                      <strong>Rajons:</strong> {listing.district}
                    </p>
                    {listing.description && (
                      <p className="sm:col-span-2">
                        <strong>Apraksts:</strong> {listing.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleFavoriteClick(listing.id)}
                    className={`btn btn-sm ${
                      listing.isFavorite ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        listing.isFavorite ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <a
                    href={listing.ssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Skatīt SS.lv
                  </a>
                  <div className="text-xs text-base-content/50">
                    Atrasts{" "}
                    {new Date(listing.foundAt!).toLocaleDateString("lv", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
