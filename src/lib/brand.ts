/**
 * CGLAB — Brand constants
 * Single source of truth for brand name, taglines, package definitions.
 */

export const BRAND = {
  name: "CGLAB",
  tagline: "AI-Generated Reels. Crafted by Humans.",
  description:
    "A productized AI media agency. You submit a brief. Our team handles ideation, AI generation, and editing. You receive a finished reel.",
  email: "hello@cglab.studio",
  // InstaPay handle for manual payment (Task 3).
  instapayHandle: "@hossyehia",
  instapayName: "Hossam Ehia",
  social: {
    twitter: "https://twitter.com/cglab",
    instagram: "https://instagram.com/cglab",
    youtube: "https://youtube.com/@cglab",
  },
} as const;

export interface PricingPackage {
  slug: string;
  name: string;
  tagline: string;
  /** Price in USD — primary display currency. */
  priceUsd: number;
  /** Price in Egyptian Pounds — secondary display currency for the EG market. */
  priceEgp: number;
  reelCount: number;
  cadence: "one-time" | "monthly";
  popular: boolean;
  features: string[];
  cta: string;
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    slug: "single",
    name: "Single Reel",
    tagline: "Test the waters with one cinematic reel.",
    priceUsd: 15,
    priceEgp: 749,
    reelCount: 1,
    cadence: "one-time",
    popular: false,
    features: [
      "1 AI-generated reel",
      "Brief & ideation included",
      "1 round of revisions",
      "1080p vertical delivery",
      "5-day turnaround",
    ],
    cta: "Start Your Project",
  },
  {
    slug: "monthly-4",
    name: "Creator",
    tagline: "Steady content for growing channels.",
    priceUsd: 57.07,
    priceEgp: 2849,
    reelCount: 4,
    cadence: "monthly",
    popular: true,
    features: [
      "4 AI-generated reels / month",
      "Dedicated creative team",
      "2 rounds of revisions per reel",
      "4K vertical delivery",
      "Priority 3-day turnaround",
      "Brand style memory",
    ],
    cta: "Become a Creator",
  },
  {
    slug: "monthly-10",
    name: "Studio",
    tagline: "Full-scale content engine for serious brands.",
    priceUsd: 140.03,
    priceEgp: 6990,
    reelCount: 10,
    cadence: "monthly",
    popular: false,
    features: [
      "10 AI-generated reels / month",
      "Dedicated creative director",
      "Unlimited revisions",
      "4K vertical + horizontal delivery",
      "48-hour priority turnaround",
      "Brand style memory + asset library",
      "Monthly strategy call",
    ],
    cta: "Talk to Us",
  },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Are the reels fully AI-generated?",
    a: "Our pipeline uses AI for ideation and asset generation, but every reel is hand-edited by a human creative team. AI is the tool — craft is the product.",
  },
  {
    q: "How long does each reel take?",
    a: "Single reels deliver in ~5 business days. Monthly plans get priority — 3 days for the Creator tier, 48 hours for the Studio tier.",
  },
  {
    q: "What if I don't like the first cut?",
    a: "Every package includes at least one revision round. The Creator and Studio tiers include 2 and unlimited revisions respectively.",
  },
  {
    q: "Can I cancel my monthly plan?",
    a: "Yes. Monthly plans are month-to-month. Cancel before your next billing date and you won't be charged again. No long-term contracts.",
  },
  {
    q: "What files do I receive?",
    a: "Vertical 1080p or 4K MP4 files, ready to publish on Reels, TikTok, and Shorts. Studio tier also includes horizontal versions for YouTube.",
  },
  {
    q: "Do you handle the script and creative direction?",
    a: "Yes — your brief is the input. We handle concept, script, AI generation, editing, color, sound design, and final delivery.",
  },
];
