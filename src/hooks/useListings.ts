import { FoundListing } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { refreshListings } from "../app/(dashboard)/dashboard/actions";

export function useListings(initialListings: FoundListing[]) {
  const [listings, setListings] = useState<FoundListing[]>(initialListings);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    try {
      setIsRefreshing(true);
      const promise = refreshListings();

      toast.promise(promise, {
        loading: "Atjaunojam sludinājumus...",
        success: "Sludinājumi atjaunoti!",
        error: "Neizdevās atjaunot sludinājumus",
      });

      await promise;
      // Force a client-side refresh after 1 second to allow the server to update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error("Failed to refresh listings:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    listings,
    isRefreshing,
    refresh,
  };
}
