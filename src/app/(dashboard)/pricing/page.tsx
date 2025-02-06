import { signIn } from "@/auth";
import { checkoutAction } from "@/lib/payments/actions";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/lib/session";
import { Bell, Check, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { SubmitButton } from "./_components/submit-btn";

export default async function PricingPage() {
  const user = await getCurrentUser();

  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  if (user && user?.hasPaid) {
    redirect("/dashboard");
  }

  const basePlan = products.find(
    (product) => product.name === "SS Dzīvokļu Paziņojumi"
  );
  const basePrice = prices.find((price) => price.productId === basePlan?.id);

  const features = [
    {
      title: "Reāllaika Paziņojumi",
      description: "Saņem tūlītējus paziņojumus par jauniem sludinājumiem",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      title: "Vairāki Meklēšanas Kritēriji",
      description: "Izveido neierobežotu skaitu meklēšanas filtru",
      icon: <Search className="w-5 h-5" />,
    },
    {
      title: "Detalizēta Filtrēšana",
      list: [
        "Cenu diapazons",
        "Istabu skaits",
        "Rajona izvēle",
        "Platības prasības",
      ],
      icon: <Check className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center justify-center mb-2">
            Sāc Meklēt Savu Sapņu Dzīvokli
          </h2>

          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-primary">
              {(basePrice?.unitAmount || 499) / 100} €
            </p>
            <p className="text-base-content/70">Vienreizējs maksājums</p>
          </div>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="text-primary mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  {feature.description && (
                    <p className="text-sm text-base-content/70">
                      {feature.description}
                    </p>
                  )}
                  {feature.list && (
                    <ul className="text-sm text-base-content/70 space-y-1 mt-1">
                      {feature.list.map((item, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            className="card-actions justify-center mt-6"
            action={async () => {
              "use server";
              if (!user) {
                await signIn("google");
              }
              if (user?.hasPaid) {
                redirect("/dashboard");
              }
              const formData = new FormData();

              formData.append("priceId", basePrice?.id || "");
              await checkoutAction(formData);
            }}
          >
            <input type="hidden" name="priceId" value={basePrice?.id} />
            <SubmitButton
              isLoggedIn={!!user}
              hasPaid={user?.hasPaid || false}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
