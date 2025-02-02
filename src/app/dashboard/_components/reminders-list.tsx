import { deleteReminder, getReminders } from "../actions";
import { appointmentTypes, type AppointmentType } from "./appointment-types";

export async function RemindersList() {
  const { reminders } = await getReminders();

  if (!reminders?.length) {
    return (
      <div className="text-center text-gray-500">
        No reminders set yet. Add one above! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-base-200 p-5 card">
      <h3 className="text-lg font-semibold">Upcoming Reminders</h3>
      <div className="grid gap-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="card bg-base-100 shadow-lg transition-shadow"
          >
            <div className="card-body p-4">
              <div className="flex gap-3 items-start">
                <div className="h-full aspect-square flex items-center justify-center rounded-full bg-base-200">
                  {appointmentTypes[reminder.name as AppointmentType]}
                </div>
                <div>
                  <h4 className="font-medium">{reminder.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(reminder.schedule).toLocaleString()}
                  </p>
                  {reminder.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      {reminder.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    "use server";
                    await deleteReminder(reminder.id);
                  }}
                  className="btn btn-ghost btn-sm text-error ml-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
