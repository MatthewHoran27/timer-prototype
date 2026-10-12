"use client";

import Link from "next/link";
import { useState } from "react";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="burger-nav" aria-label="Main navigation">
      <button
        type="button"
        className="burger-button"
        aria-expanded={isOpen}
        aria-controls="main-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        Menu
      </button>

      {isOpen ? (
        <div id="main-menu" className="burger-panel">
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/timer" onClick={closeMenu}>
            Timer
          </Link>
          <Link href="/overlay-editor" onClick={closeMenu}>
            Overlay Editor
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
