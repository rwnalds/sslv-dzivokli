import { Heart } from "lucide-react";
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
            <svg
              width="40"
              height="40"
              viewBox="0 0 512 512"
              className="text-primary"
            >
              <rect width="512" height="512" rx="64" fill="currentColor" />
              <path
                d="M256 96L96 256H144V384H368V256H416L256 96Z"
                fill="white"
              />
              <text
                x="256"
                y="320"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="bold"
                fontSize="120"
                fill="white"
              >
                SS
              </text>
            </svg>
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
