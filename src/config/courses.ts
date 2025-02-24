import { Course, ReattunementOption } from '@/types';

export const COURSES: Course[] = [
  {
    id: 'class-1',
    title: 'Chakra Alignment Technique for Self-Healing',
    description: "You'll learn and practice a structured chakra balancing method for self-Reiki that starts from the feet and ends at the head.",
    date: 'March 18',
    price: 9500, // $95.00
  },
  {
    id: 'class-2',
    title: 'Opening & Sealing Technique with Crystals',
    description: "You'll learn and practice the opening & sealing technique, the Chakra Mapping Form, and crystals to expand your remote Reiki practice.",
    date: 'March 20',
    price: 9500,
  },
  {
    id: 'class-3',
    title: 'Energy Measurement with Pendulum',
    description: "You'll learn and practice using the pendulum for self-treatment, combining it with Reiki for deeper energy alignment.",
    date: 'March 25',
    price: 9500,
  },
  {
    id: 'class-4',
    title: 'Energy & Space Clearing',
    description: "You'll learn and practice integrating Reiki symbols, mantras, and the pendulum to clear and bless your energy and space.",
    date: 'March 27',
    price: 9500,
  },
  {
    id: 'class-5',
    title: 'Complete Home & Self Clearing',
    description: "You'll learn and practice measuring, clearing, and blessing your entire home—including all rooms and surroundings—using Reiki, the pendulum, salt, palo santo, sage, and sound.",
    date: 'April 1',
    price: 9500,
  },
];

export const BUNDLE_PRICE = 39500; // $395.00

export const REATTUNEMENT: ReattunementOption = {
  id: 'reattunement',
  title: 'Private Reiki Re-Attunement with Michal',
  price: 9700, // $97.00
};

export const COURSE_TITLE = 'Reiki Expansion & Reactivation';
export const COURSE_SUBTITLE = 'A Five-Part Immersive Course';
export const COURSE_DESCRIPTION = 'Go Beyond Traditional Reiki—Integrate Chakra Alignment & the Pendulum into Your Practice.';
