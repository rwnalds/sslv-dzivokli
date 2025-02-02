import { Bell, Check, Home, Mail, Search, Send } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "src/auth";

export const metadata: Metadata = {
  title: "Home - SS.lv Apartment Finder",
  description:
    "Get instant notifications for new apartment listings on SS.lv that match your criteria. Never miss your dream apartment again.",
};

export default async function Page() {
  const session = await auth();

  if (session?.user?.id) redirect("/dashboard");

  const features = [
    {
      title: "Real-time Notifications",
      description:
        "Get instant alerts when new apartments matching your criteria are listed",
      icon: <Bell className="w-8 h-8 text-primary" />,
    },
    {
      title: "Smart Search",
      description: (
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Check className="w-4 text-secondary" /> Price range filtering
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-secondary" /> Room count preferences
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-secondary" /> District selection
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-secondary" /> Area requirements
          </li>
        </ul>
      ),
      icon: <Search className="w-8 h-8 text-primary" />,
    },
    {
      title: "Apartment Tracking",
      description: "Keep track of all interesting listings in one place",
      icon: <Home className="w-8 h-8 text-primary" />,
    },
  ];

  async function sendEmail(formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString();
    const message = formData.get("message")?.toString();

    // Here you would implement your email sending logic
    console.log("Send email:", { email, message });
  }

  return (
    <div className="min-h-screen p-5">
      {/* Hero Section */}
      <div className="min-h-[90vh] max-w-6xl m-auto grid grid-rows-[1fr_auto] mb-24">
        <div className="flex flex-col items-center min-h-[60vh] lg:min-h-max justify-center text-center mb-24">
          <h1 className="text-5xl lg:text-5xl font-extrabold text-base-content">
            Find Your <span className="text-primary">Dream Apartment</span> in{" "}
            <span className="text-primary">Riga</span>
          </h1>
          <p className="py-6 lg:text-xl mb-6 text-base-content/80">
            Get instant notifications when new apartments matching your criteria
            appear on SS.lv. <u>Never miss</u> your perfect home again.
          </p>
          <Link href="/install" className="btn btn-primary btn-lg">
            Start Searching Now
          </Link>
        </div>
        {/* Features Section */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i}>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  {feature.icon}
                  <h2 className="card-title text-base-content/80">
                    {feature.title}
                  </h2>
                </div>
                <div className="text-base-content/70">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-2xl mx-auto pb-24">
        <div className="flex items-center gap-3 justify-center mb-12">
          <Mail className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-center">Contact us</h2>
        </div>

        <form action={sendEmail} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea
              name="message"
              className="textarea textarea-bordered h-32"
              placeholder="How can we help you?"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
