import {
  Building2,
  Compass,
  Database,
  Layers,
  Map,
  ScrollText,
  TrendingUp,
} from 'lucide-react';

export const navigationGroups = [
  {
    label: 'Analysis',
    links: [
      { to: '/', label: 'Overview', icon: Compass, end: true },
      { to: '/crime-trends', label: 'Crime Trends', icon: TrendingUp },
      { to: '/crime-categories', label: 'Crime Categories', icon: Layers },
      { to: '/metro-comparison', label: 'Metro Comparison', icon: Building2 },
    ],
  },
  {
    label: 'Geography',
    links: [
      { to: '/geographic-explorer', label: 'Geographic Explorer', icon: Map },
    ],
  },
  {
    label: 'Evidence',
    links: [
      { to: '/data-sources', label: 'Data Sources', icon: Database },
      { to: '/methodology', label: 'Methodology', icon: ScrollText },
    ],
  },
];
