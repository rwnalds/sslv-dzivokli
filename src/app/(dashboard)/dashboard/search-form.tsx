"use client";

import { categories } from "@/lib/ss/categories";
import { regions } from "@/lib/ss/regions";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addSearchCriteria } from "./actions";

const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6];

export function SearchForm() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<
    Array<{ name: string; urlSlug: string }>
  >([]);

  useEffect(() => {
    const region = regions.find((r) => r.name === selectedRegion);
    if (region) {
      setDistricts(region.districts);
    } else {
      setDistricts([]);
    }
  }, [selectedRegion]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Get the selected district's urlSlug
    const districtName = formData.get("district")?.toString();
    const district = districts.find((d) => d.name === districtName);
    if (districtName && !district) {
      toast.error("Nepareizs rajons");
      return;
    }

    // Replace district name with urlSlug in formData
    if (district) {
      formData.set("district", district.urlSlug);
    }

    setIsSubmitting(true);
    const promise = addSearchCriteria(formData);

    toast.promise(promise, {
      loading: "Pievienojam meklēšanas kritērijus...",
      success: (data) => {
        form.reset();
        setSelectedRegion("");
        router.refresh();
        return data.message || "Meklēšanas kritēriji pievienoti!";
      },
      error: (err) => err.error || "Neizdevās pievienot meklēšanas kritērijus",
    });

    try {
      await promise;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Reģions</span>
        </label>
        <select
          name="region"
          className="select select-bordered w-full"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          required
        >
          <option value="">Izvēlies reģionu</option>
          {regions.map((region) => (
            <option key={region.name} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {districts.length > 0 && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Rajons</span>
          </label>
          <select name="district" className="select select-bordered w-full">
            <option value="">Visi rajoni</option>
            {districts.map((district) => (
              <option key={district.urlSlug} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">Kategorija</span>
        </label>
        <select
          name="category"
          className="select select-bordered w-full"
          required
        >
          <option value="">Izvēlies kategoriju</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min. cena</span>
          </label>
          <input
            type="number"
            name="minPrice"
            className="input input-bordered w-full"
            min="0"
            placeholder="Piem., 500"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max. cena</span>
          </label>
          <input
            type="number"
            name="maxPrice"
            className="input input-bordered w-full"
            min="0"
            placeholder="Piem., 1000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min. istabas</span>
          </label>
          <select name="minRooms" className="select select-bordered w-full">
            <option value="">Nav ierobežojumu</option>
            {ROOM_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max. istabas</span>
          </label>
          <select name="maxRooms" className="select select-bordered w-full">
            <option value="">Nav ierobežojumu</option>
            {ROOM_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min. platība</span>
          </label>
          <input
            type="number"
            name="minArea"
            className="input input-bordered w-full"
            min="0"
            placeholder="Piem., 40"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max. platība</span>
          </label>
          <input
            type="number"
            name="maxArea"
            className="input input-bordered w-full"
            min="0"
            placeholder="Piem., 80"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              Pievienot Meklēšanu
            </>
          )}
        </button>
      </div>
    </form>
  );
}
