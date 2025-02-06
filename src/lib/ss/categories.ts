export type Category = {
  name: string;
  urlPath: string;
  value: string;
};

export const categories: Category[] = [
  {
    name: "Pārdod",
    urlPath: "sell",
    value: "sell",
  },
  {
    name: "Izīrē",
    urlPath: "hand_over",
    value: "rent-out",
  },
  {
    name: "Pērk",
    urlPath: "buy",
    value: "buy",
  },
  {
    name: "Īrē",
    urlPath: "rent",
    value: "rent-in",
  },
];
