export type Region = {
  name: string;
  urlPath: string;
  districts: {
    name: string;
    urlSlug: string;
  }[];
};

export const regions: Region[] = [
  {
    name: "Rīga",
    urlPath: "riga",
    districts: [
      { name: "Centrs", urlSlug: "centre" },
      { name: "Āgenskalns", urlSlug: "agenskalns" },
      { name: "Dārzciems", urlSlug: "darzciems" },
      { name: "Ķengarags", urlSlug: "kengarags" },
      { name: "Mežaparks", urlSlug: "mezaparks" },
      { name: "Purvciems", urlSlug: "purvciems" },
      { name: "Vecrīga", urlSlug: "vecriga" },
    ],
  },
  {
    name: "Liepāja",
    urlPath: "liepaja-and-reg",
    districts: [
      { name: "Aizpute", urlSlug: "aizpute" },
      { name: "Durbe", urlSlug: "durbe" },
      { name: "Grobiņa", urlSlug: "grobina" },
      { name: "Liepāja", urlSlug: "liepaja" },
      { name: "Pāvilosta", urlSlug: "pavilosta" },
      { name: "Priekule", urlSlug: "priekule" },
      { name: "Aizputes pag.", urlSlug: "aizputes-pag" },
      { name: "Bārtas pag.", urlSlug: "bartas-pag" },
      { name: "Bunkas pag.", urlSlug: "bunkas-pag" },
      { name: "Dunalkas pag.", urlSlug: "dunalkas-pag" },
      { name: "Gaviezes pag.", urlSlug: "gaviezes-pag" },
      { name: "Grobiņas pag.", urlSlug: "grobinas-pag" },
      { name: "Kalētu pag.", urlSlug: "kaletu-pag" },
      { name: "Medzes pag.", urlSlug: "medzes-pag" },
      { name: "Nīcas pag.", urlSlug: "nicas-pag" },
      { name: "Otaņķu pag.", urlSlug: "otanku-pag" },
      { name: "Priekules pag.", urlSlug: "priekules-pag" },
      { name: "Rucavas pag.", urlSlug: "rucavas-pag" },
      { name: "Sakas pag.", urlSlug: "sakas-pag" },
      { name: "Tadaiķu pag.", urlSlug: "tadaiku-pag" },
      { name: "Vaiņodes pag.", urlSlug: "vainodes-pag" },
      { name: "Virgas pag.", urlSlug: "virgas-pag" },
      { name: "Visi sludinājumi", urlSlug: "all" },
    ],
  },
  {
    name: "Ventspils",
    urlPath: "ventspils-and-reg",
    districts: [
      { name: "Piltene", urlSlug: "piltene" },
      { name: "Ventspils", urlSlug: "ventspils" },
      { name: "Jūrkalnes pag.", urlSlug: "jurkalnes-pag" },
      { name: "Puzes pag.", urlSlug: "puzes-pag" },
      { name: "Tārgales pag.", urlSlug: "targales-pag" },
      { name: "Ugāles pag.", urlSlug: "ugales-pag" },
      { name: "Užavas pag.", urlSlug: "uzavas-pag" },
      { name: "Vārves pag.", urlSlug: "varves-pag" },
      { name: "Visi sludinājumi", urlSlug: "all" },
    ],
  },
];
