import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="p-10 footer bg-base-200 text-base-content">
        <nav>
          <h6 className="footer-title">Contacts</h6>
          <Link
            className="link link-hover"
            href="https://www.linkedin.com/in/j%C4%81nis-jansons/"
          >
            Jānis Jansons
          </Link>
          <Link className="link link-hover" href="mailto:jansons.ljp@gmail.com">
            jansons.ljp@gmail.com
          </Link>
          <Link className="link link-hover" href="tel:28605508">
            +371 28605508
          </Link>
        </nav>
        {/* <form>
          <h6 className="footer-title">Newsletter</h6>
          <fieldset className="form-control w-80">
            <label className="label">
              <span className="label-text">Enter your email address</span>
            </label>
            <div className="join">
              <input
                type="text"
                placeholder="username@site.com"
                className="input input-bordered join-item"
              />
              <button className="btn btn-primary join-item">Subscribe</button>
            </div>
          </fieldset>
        </form> */}
        <div className="flex items-end justify-self-end flex-col">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="Logo" width={40} height={40} />
            <h2 className="font-bold text-xl">PetLove</h2>
          </div>
          <p>Healthier pets in Easier way</p>
          <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
        </div>
      </div>
      <div className="text-sm bg-black w-full text-white grid md:grid-cols-2 p-2 gap-x-5 gap-y-1">
        <div className="md:place-self-end">
          Founded by{" "}
          <Link
            className="underline"
            href="https://www.linkedin.com/in/j%C4%81nis-jansons/"
          >
            Jānis Jansons
          </Link>
        </div>
        <div className="flex items-end self-center place-self-start gap-1">
          Crafted with <Heart className="text-red-400 w-4 inline" /> by{" "}
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
