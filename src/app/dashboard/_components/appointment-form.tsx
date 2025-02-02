"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createAppointment } from "../actions";
import { appointmentTypes } from "./appointment-types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="loading loading-spinner"></span>
          Creating...
        </>
      ) : (
        "Create Reminder"
      )}
    </button>
  );
}

export function AppointmentForm() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createAppointment(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Reminder created successfully!" });
      // Reset form
      (document.getElementById("appointment-form") as HTMLFormElement).reset();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Something went wrong",
      });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="max-w-md mx-auto rounded-xl space-y-6 bg-white">
      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {message.text}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4" id="appointment-form">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Reminder Type</span>
          </label>
          <select
            name="appointmentType"
            className="select select-primary w-full"
            required
          >
            <option value="">Select reminder type</option>
            {Object.entries(appointmentTypes).map(([type, emoji]) => (
              <option key={type} value={type}>
                {emoji} {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Date & Time</span>
          </label>
          <input
            name="dateTime"
            type="datetime-local"
            className="input input-bordered input-primary w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Recurrence</span>
          </label>
          <select
            name="recurrence"
            className="select select-primary w-full"
            defaultValue="none"
          >
            <option value="none">One-time reminder</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            name="notes"
            className="textarea textarea-primary h-24"
            placeholder="Any special instructions or notes..."
          />
        </div>

        <div className="form-control mt-6">
          <SubmitButton />
        </div>
      </form>

      <div className="text-center text-sm text-gray-500">
        We&apos;ll send you a notification when it&apos;s time! 🔔
      </div>
    </div>
  );
}
