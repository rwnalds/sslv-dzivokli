"use client";

import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { SearchCriteria } from "@prisma/client";
import { Power, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSearchCriteria, toggleSearchCriteria } from "./actions";

export function SearchCriteriaList({
  criteria,
}: {
  criteria: SearchCriteria[];
}) {
  const router = useRouter();

  async function handleToggle(id: number, currentlyActive: boolean) {
    const promise = toggleSearchCriteria(id, !currentlyActive);

    toast.promise(promise, {
      loading: "Mainām meklēšanas statusu...",
      success: (data) => {
        router.refresh();
        return data.message || "Meklēšanas status mainīts!";
      },
      error: (err) => err.error || "Neizdevās mainīt meklēšanas statusu",
    });
  }

  async function handleDelete(id: number) {
    const promise = deleteSearchCriteria(id);

    toast.promise(promise, {
      loading: "Dzēšam meklēšanas kritērijus...",
      success: (data) => {
        router.refresh();
        return data.message || "Meklēšanas kritēriji izdzēsti!";
      },
      error: (err) => err.error || "Neizdevās izdzēst meklēšanas kritērijus",
    });
  }

  function getCategoryName(value: string) {
    return categories.find((c) => c.value === value)?.name || value;
  }

  function getDistrictName(region: string, districtSlug: string | null) {
    if (!districtSlug) return null;
    const regionData = regions.find((r) => r.name === region);
    return (
      regionData?.districts.find((d) => d.urlSlug === districtSlug)?.name ||
      districtSlug
    );
  }

  function formatRange(min: any, max: any, unit: string = "") {
    if (min && !max) {
      return `Sākot no ${min}${unit}`;
    }
    if (!min && max) {
      return `Līdz ${max}${unit}`;
    }
    if (min && max) {
      return `${min}${unit} - ${max}${unit}`;
    }
    return "Nav ierobežojumu";
  }

  if (criteria.length === 0) {
    return (
      <p className="text-base-content/70">
        Nav pievienots neviens meklēšanas kritērijs.
      </p>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {criteria.map((item) => (
        <div
          key={item.id}
          className={`card bg-base-100 shadow-sm ${
            !item.isActive ? "opacity-50" : ""
          }`}
        >
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="font-medium">
                  {item.region}
                  {item.district &&
                    ` - ${getDistrictName(item.region, item.district)}`}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-base-content/70">
                  <p>
                    Cena:{" "}
                    {formatRange(
                      item.minPrice ? `${item.minPrice}` : null,
                      item.maxPrice ? `${item.maxPrice}` : null,
                      "€"
                    )}
                  </p>
                  <p>Istabas: {formatRange(item.minRooms, item.maxRooms)}</p>
                  <p>
                    Platība:{" "}
                    {formatRange(
                      item.minArea ? `${item.minArea}` : null,
                      item.maxArea ? `${item.maxArea}` : null,
                      "m²"
                    )}
                  </p>
                  {item.lastChecked && (
                    <p>
                      Pēdējo reizi pārbaudīts:{" "}
                      {new Date(item.lastChecked).toLocaleDateString("lv", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleToggle(item.id, Boolean(item.isActive))}
                  className={`btn btn-sm btn-ghost ${
                    item.isActive ? "text-success" : "text-base-content/50"
                  }`}
                  title={
                    item.isActive ? "Apturēt meklēšanu" : "Aktivizēt meklēšanu"
                  }
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-sm btn-ghost text-error"
                  title="Dzēst meklēšanu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
