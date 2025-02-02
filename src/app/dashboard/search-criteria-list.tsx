"use client";

import { Power, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { type SearchCriteria } from "src/db/schema";
import { deleteSearchCriteria, toggleSearchCriteria } from "./actions";

export function SearchCriteriaList({
  criteria,
}: {
  criteria: SearchCriteria[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(criteriaId: number) {
    startTransition(async () => {
      await deleteSearchCriteria(criteriaId);
    });
  }

  function handleToggle(criteriaId: number, isActive: boolean | null) {
    startTransition(async () => {
      await toggleSearchCriteria(criteriaId, !(isActive ?? true));
    });
  }

  if (criteria.length === 0) {
    return (
      <p className="text-base-content/70">
        No active searches. Add one above to start finding apartments!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {criteria.map((item) => (
        <div key={item.id} className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {item.district || "Any District"}
                </h3>
                <p className="text-sm text-base-content/70">
                  {item.minPrice || "Any"} - {item.maxPrice || "Any"} €
                </p>
                <p className="text-sm text-base-content/70">
                  {item.minRooms || "Any"} - {item.maxRooms || "Any"} rooms
                </p>
                {(item.minArea || item.maxArea) && (
                  <p className="text-sm text-base-content/70">
                    {item.minArea || "Any"} - {item.maxArea || "Any"} m²
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div
                  className={`badge ${
                    item.isActive ? "badge-success" : "badge-ghost"
                  }`}
                >
                  {item.isActive ? "Active" : "Paused"}
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-ghost btn-xs ${
                      isPending ? "loading" : ""
                    }`}
                    onClick={() => handleToggle(item.id, item.isActive)}
                    disabled={isPending}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    className={`btn btn-ghost btn-xs ${
                      isPending ? "loading" : ""
                    }`}
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
