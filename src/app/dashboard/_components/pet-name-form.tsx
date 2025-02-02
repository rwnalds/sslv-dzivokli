"use client";

import { Pet } from "src/db/schema";

export function PetNameForm({ pet, userId }: { pet?: Pet; userId: string }) {
  return (
    <>
      <input
        className="input input-ghost w-full text-3xl font-bold px-2"
        type="text"
        name="name"
        placeholder="Your pet name"
        defaultValue={pet?.name ?? ""}
        onBlur={(e) => {
          if (e.target.form) {
            e.target.form.requestSubmit();
          }
        }}
      />
      <button className="hidden" type="submit" />
    </>
  );
}
