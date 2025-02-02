"use client";

import { ExternalLink } from "lucide-react";
import { type FoundListing } from "src/db/schema";

export function ListingsList({ listings }: { listings: FoundListing[] }) {
  if (listings.length === 0) {
    return (
      <p className="text-base-content/70">
        No listings found yet. We'll notify you when new apartments matching
        your criteria appear!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <div key={listing.id} className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">{listing.title}</h3>
                <div className="mt-2 space-y-1 text-sm text-base-content/70">
                  <p>
                    <strong>Price:</strong> {listing.price}€
                  </p>
                  <p>
                    <strong>Rooms:</strong> {listing.rooms}
                  </p>
                  <p>
                    <strong>Area:</strong> {listing.area} m²
                  </p>
                  <p>
                    <strong>District:</strong> {listing.district}
                  </p>
                  {listing.description && (
                    <p>
                      <strong>Description:</strong> {listing.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <a
                  href={listing.ssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-ghost"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on SS.lv
                </a>
                <div className="text-xs text-base-content/50">
                  Found{" "}
                  {new Date(listing.foundAt!).toLocaleDateString("en-GB", {
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
  );
}
