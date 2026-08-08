import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* L'anteprima dell'app (build web di Expo in /public/app-anteprima) va
     servita su un indirizzo PULITO, senza /index.html in coda: il router
     dell'app legge l'indirizzo del browser e con /index.html appeso non
     riconosce la rotta ("Unmatched Route"). */
  async rewrites() {
    return [{ source: "/app-anteprima", destination: "/app-anteprima/index.html" }];
  },
};

export default nextConfig;
