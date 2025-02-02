"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { db, searchCriteria } from "src/db/schema";

export function SearchForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function addSearchCriteria(formData: FormData) {
    const district = formData.get("district")?.toString();
    const minPrice = formData.get("minPrice")?.toString();
    const maxPrice = formData.get("maxPrice")?.toString();
    const minRooms = formData.get("minRooms")?.toString();
    const maxRooms = formData.get("maxRooms")?.toString();
    const minArea = formData.get("minArea")?.toString();
    const maxArea = formData.get("maxArea")?.toString();

    startTransition(async () => {
      try {
        await db.insert(searchCriteria).values({
          userId,
          district: district || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          minRooms: minRooms ? parseInt(minRooms) : null,
          maxRooms: maxRooms ? parseInt(maxRooms) : null,
          minArea: minArea || null,
          maxArea: maxArea || null,
          isActive: true,
        });
        router.refresh();
      } catch (error) {
        console.error("Failed to add search criteria:", error);
      }
    });
  }

  return (
    <form action={addSearchCriteria} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">District</span>
        </label>
        <select name="district" className="select select-bordered w-full">
          <option value="">Any District</option>
          <option value="centre">Centre</option>
          <option value="purvciems">Purvciems</option>
          <option value="teika">Teika</option>
          <option value="agenskalns">Agenskalns</option>
          <option value="imanta">Imanta</option>
          {/* Add more districts as needed */}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min Price (€)</span>
          </label>
          <input
            type="number"
            name="minPrice"
            placeholder="Any"
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max Price (€)</span>
          </label>
          <input
            type="number"
            name="maxPrice"
            placeholder="Any"
            className="input input-bordered"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min Rooms</span>
          </label>
          <input
            type="number"
            name="minRooms"
            placeholder="Any"
            min="1"
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max Rooms</span>
          </label>
          <input
            type="number"
            name="maxRooms"
            placeholder="Any"
            min="1"
            className="input input-bordered"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min Area (m²)</span>
          </label>
          <input
            type="number"
            name="minArea"
            placeholder="Any"
            min="1"
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Max Area (m²)</span>
          </label>
          <input
            type="number"
            name="maxArea"
            placeholder="Any"
            min="1"
            className="input input-bordered"
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isPending}
      >
        <Search className="w-4 h-4" />
        {isPending ? "Adding..." : "Add Search"}
      </button>
    </form>
  );
}
