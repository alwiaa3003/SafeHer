import { Database, Map, ScrollText, TrendingUp } from 'lucide-react';

// Main navigation. Crime Categories, Metro Comparison and the former Overview keep their
// routes but are not listed until they have verified data of their own.
export const navigationGroups = [
  {
    label: 'Explore',
    links: [
      { to: '/', label: 'Crime Map', icon: Map, end: true },
      { to: '/crime-trends', label: 'Crime Trends', icon: TrendingUp },
    ],
  },
  {
    label: 'Information',
    links: [
      { to: '/data-sources', label: 'Data & Sources', icon: Database },
      { to: '/methodology', label: 'Methodology', icon: ScrollText },
    ],
  },
];
