"use client";

import { RefreshCw } from "lucide-react";
import { useListings } from "../../../hooks/useListings";

export default function RefreshButton() {
  const { refresh, isRefreshing } = useListings([]);

  return (
    <button
      onClick={refresh}
      className="btn btn-ghost btn-sm"
      disabled={isRefreshing}
      title="Atjaunot sludinājumus"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </button>
  );
}
