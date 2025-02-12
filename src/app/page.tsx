import { auth } from "@/auth";
import { Bell, Check, Home, Search } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import IPhone from "./_components/iphone";

export const metadata: Metadata = {
  title: "Sākums | SSpots",
  description:
    "Saņem tūlītējus paziņojumus par jauniem dzīvokļu sludinājumiem SS.lv, kas atbilst tavam budžetam un vajadzībām. Esi pirmais, kas uzzina par izdevīgiem piedāvājumiem.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  if (session?.user?.id && session.user.hasPaid) {
    redirect("/dashboard");
  }

  const features = [
    {
      title: "Tūlītēji Paziņojumi",
      description:
        "Esi pirmais, kas uzzina par jauniem dzīvokļiem tavā cenu kategorijā un rajonā",
      icon: <Bell className="w-8 h-8 text-primary" />,
    },
    {
      title: "Precīza Meklēšana",
      description: (
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Check className="w-4 text-primary" /> Tavs budžeta limits
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-primary" /> Nepieciešamās telpas
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-primary" /> Vēlamais rajons
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 text-primary" /> Minimālā platība
          </li>
        </ul>
      ),
      icon: <Search className="w-8 h-8 text-primary" />,
    },
    {
      title: "Izdevīgu Piedāvājumu Sekošana",
      description:
        "Pārskati visus aktuālos sludinājumus, kas atbilst tavām prasībām",
      icon: <Home className="w-8 h-8 text-primary" />,
    },
  ];

  return (
    <div className="p-5">
      {/* Hero Section */}
      <div className="min-h-[90vh] max-w-6xl m-auto grid grid-rows-[1fr_auto] mb-24">
        <div className="flex flex-col items-center min-h-[60vh] lg:min-h-max justify-center text-center mb-24">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-base-content">
            Atrodi sev{" "}
            <span className="text-primary">piemērotāko dzīvokli</span> par labu
            cenu
          </h1>
          <p className="py-6 lg:text-xl mb-6 text-base-content/80">
            Saņem tūlītējus paziņojumus par jauniem sludinājumiem SS.lv.{" "}
            <u>Esi pirmais</u>, kas uzzina par izdevīgiem piedāvājumiem.
          </p>
          <Link href="/pricing" className="btn btn-primary btn-lg">
            Sākt Meklēšanu
          </Link>
        </div>
        {/* Demo Section */}
        <div className="max-w-6xl mx-auto flex justify-center">
          <IPhone />
        </div>
      </div>
      {/* Features Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-24">
        {features.map((feature, i) => (
          <div key={i}>
            <div className="card-body">
              <div className="flex items-start gap-3 mb-4">
                {feature.icon}
                <h2 className="card-title">{feature.title}</h2>
              </div>
              <div className="text-base-content/70">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing + Features Section */}
      <div className="max-w-xl mx-auto text-center mb-24 px-4 space-y-8">
        <div className="space-y-4">
          <h2 className="text-primary text-4xl md:text-6xl font-bold">
            4.99 €
          </h2>
          <h5 className="text-xl md:text-2xl font-medium text-base-content/90">
            Vienreizējs maksājums, <u>bez abonementa</u>
          </h5>
        </div>

        <div className="space-y-4">
          <h3 className="md:text-xl font-medium text-base-content/80">
            Tu iegūsti:
          </h3>
          <ul className="space-y-3 text-base-content/70">
            <li className="flex items-center gap-2 justify-center text-left">
              <Check className="w-5 h-5 text-primary" />
              Tūlītēji paziņojumi par izdevīgiem piedāvājumiem
            </li>
            <li className="flex items-center gap-2 justify-center text-left">
              <Check className="w-5 h-5 text-primary" />
              Neierobežots skaits meklēšanas kritēriju
            </li>
            <li className="flex items-center gap-2 justify-center text-left">
              <Check className="w-5 h-5 text-primary" />
              Piekļuve visiem jaunajiem sludinājumiem
            </li>
            <li className="flex items-center gap-2 justify-center text-left">
              <Check className="w-5 h-5 text-primary" />
              Ietaupi laiku un atrodi labāko piedāvājumu
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link href="/pricing" className="btn btn-primary btn-lg">
            Sākt Meklēšanu
          </Link>
        </div>
      </div>

      {/* PWA Section */}
      <div className="max-w-6xl mx-auto text-center mb-24 px-4">
        <div className="space-y-4 max-w-xl mx-auto mb-6">
          <h2 className="font-bold text-2xl justify-center mb-4">
            Lejuplādē Aplikāciju 📱
          </h2>
          <p className="text-base-content/70 mb-6">
            SSpots var instalēt kā aplikāciju uz sava tālruņa. <u>Ieteicams</u>,
            jo tādējādi varēsi saņemt paziņojumus par jauniem sludinājumiem, kas
            ir šīs aplikācijas galvenā fīča.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Android Instructions */}
          <div className="space-y-4 card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title font-medium text-lg">
                Android Lietotājiem
              </h3>
              <ol className="text-left space-y-2 text-base-content/70">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">1.</span>
                  <span>Atver Chrome pārlūku</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">2.</span>
                  <span>Nospied uz trīs punktiem augšējā labajā stūrī</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">3.</span>
                  <span>Izvēlies &quot;Pievienot sākuma ekrānam&quot;</span>
                </li>
              </ol>
            </div>
          </div>

          {/* iOS Instructions */}
          <div className="space-y-4 card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title font-medium text-lg">
                iPhone Lietotājiem
              </h3>
              <ol className="text-left space-y-2 text-base-content/70">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">1.</span>
                  <span>Atver Safari pārlūku</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">2.</span>
                  <span>
                    Nospied uz &quot;Kopīgot&quot; pogas (kvadrāts ar bultiņu)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">3.</span>
                  <span>Izvēlies &quot;Pievienot sākuma ekrānam&quot;</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div className="max-w-xl mx-auto text-center mb-24">
          <h2 className="card-title text-2xl justify-center mb-4">
            Kā tas strādā?
          </h2>
          <p className="text-base-content/70 mb-6">
            Šī lapa darbojas kā mobilā aplikācija, kad atrodas uz tava telefona.
            Tā aizņem daudz mazāk atmiņas nekā parasta mobilā aplikācija, bet
            var sūtīt paziņojumus par jauniem sludinājumiem. Es to dēvēju par
            nākotnes tehnoloģiju 😎
          </p>
        </div>
      </div>

      {/* Me section */}
      <div className="max-w-6xl mx-auto mt-24 relative min-h-[400px]">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left side with image */}
          <div className="relative flex flex-col items-center md:items-end">
            <p className="md:hidden text-base-content/70 text-center pb-5">
              Šīs aplikācijas izstrādātājs arī šobrīd meklē dzīvokli
            </p>
            <div className="relative w-[200px] md:w-[300px]">
              <Image
                src="/landing/me.png"
                alt="Me"
                width={300}
                height={800}
                className="w-full h-auto"
              />
              {/* Squiggly Arrow */}
              <svg
                className="absolute top-[100px] -right-[8px] hidden md:block w-16 h-12 text-base-content/50 rotate-180"
                viewBox="0 0 100 40"
              >
                <path
                  d="M0,20 Q25,0 50,20 T100,20 L95,15 M95,25 L100,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
              {/* Text */}
              <p className="hidden md:block absolute -right-[100px] md:-right-[320px] top-[90px] w-[200px] md:w-[300px] text-lg text-base-content/70 -rotate-[6deg]">
                Šīs aplikācijas izstrādātājs arī
                <br />
                šobrīd meklē dzīvokli
              </p>
            </div>
          </div>

          {/* Right side with text and future content */}
          <div className="flex flex-col justify-center gap-12 p-10 md:p-0">
            {/* Space for future content */}
            <div>
              &quot;Baigi piebesīja katru dienu bezcerīgi šķirstīt ss.lv. Šito
              rīku uztaisīju, lai nevajadzētu tā vairs darīt. Ir pagājušas{" "}
              <span className="font-bold text-primary">
                {Math.floor(
                  (new Date().getTime() - new Date("2025-02-11").getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                dienas
              </span>
              , kopš pats šo izmantoju. Tiesa, ka pats vēl esmu meklējumos,
              tādēļ, ja tev ir kaut kas piedāvājams, es labprāt to uzklausītu :)
            </div>
            <div className="text-sm text-base-content/70">~ Ronalds ❤️</div>
          </div>
        </div>
      </div>
    </div>
  );
}
