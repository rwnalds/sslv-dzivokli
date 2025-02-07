import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="p-10 footer bg-base-200 text-base-content">
        <nav>
          <h6 className="footer-title">Kontakti</h6>
          <Link
            className="link link-hover"
            href="https://linkedin.com/in/ronalds-palacis/"
          >
            Ronalds Palacis
          </Link>
          <Link
            className="link link-hover"
            href="mailto:ronalds.palacis@gmail.com"
          >
            ronalds.palacis@gmail.com
          </Link>
        </nav>
        <div className="flex items-end justify-self-end flex-col">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="SSpots" width={32} height={32} />
            <h2 className="font-bold text-xl">SSpots</h2>
          </div>
          <p>Atrodi Savu Sapņu Dzīvokli</p>
          <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
        </div>
      </div>
      <div className="text-sm bg-black w-full text-white grid place-items-center p-2 gap-1">
        <div className="flex items-center gap-1">
          Crafted with <Heart className="text-red-400 w-4" /> by{" "}
          <Link
            className="underline"
            href="https://linkedin.com/in/ronalds-palacis/"
          >
            Ronalds Palacis
          </Link>
        </div>
      </div>
    </footer>
  );
}
