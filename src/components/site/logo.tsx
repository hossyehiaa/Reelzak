"use client";

import * as React from "react";
import Image from "next/image";

interface LogoProps {
  /** Height of the logo in pixels. Width auto-scales to preserve aspect ratio. */
  height?: number;
  /** Additional classes for the wrapper. */
  className?: string;
  /** Optional alt text override. Defaults to "CGLAB". */
  alt?: string;
  /** Render at reduced opacity (useful for footer / secondary placements). */
  dim?: boolean;
}

/**
 * CGLAB brand logo.
 *
 * Renders the custom wordmark PNG via next/image for automatic optimization,
 * responsive srcset, and lazy-loading. The source is 350×98 (≈3.57:1 wide
 * wordmark with transparent background, cropped tight to the content).
 *
 * Usage:
 *   <Logo />                       // default: 40px tall, full opacity
 *   <Logo height={48} />           // taller variant for hero / auth panels
 *   <Logo height={32} dim />       // smaller, dimmed for footer
 */
export function Logo({ height = 40, className = "", alt = "CGLAB", dim = false }: LogoProps) {
  // Source dimensions: 350 × 98 → aspect ratio 3.571
  const width = Math.round(height * (350 / 98));
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      priority
      className={`select-none ${dim ? "opacity-80" : ""} ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}
