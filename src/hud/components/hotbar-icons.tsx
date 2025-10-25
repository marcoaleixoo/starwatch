import type { SVGProps } from 'react';

export type HotbarIconId = 'deck' | 'solar-panel' | 'battery' | 'terminal';

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const iconSizeProps = {
  width: 32,
  height: 32,
  viewBox: '0 0 32 32',
  role: 'img' as const,
  'aria-hidden': true,
};

const DeckIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="2" y="6" width="28" height="20" rx="4" fill="#1f273a" stroke="#4f6fc5" strokeWidth="2" />
    <path d="M6 12h20" stroke="#7a9bff" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 18h20" stroke="#3e58a8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
  </svg>
);

const SolarPanelIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="4" y="7" width="24" height="18" rx="3" fill="#0b1e3a" stroke="#45d3ff" strokeWidth="2" />
    <path d="M4 13h24M4 19h24M12 7v18M20 7v18" stroke="#72ebff" strokeWidth="1.6" opacity="0.8" />
    <circle cx="26" cy="6" r="3" fill="#ffda5c" opacity="0.85" />
  </svg>
);

const BatteryIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="7" y="6" width="18" height="20" rx="4" fill="#131b2c" stroke="#8ce1ff" strokeWidth="2" />
    <rect x="13" y="2" width="6" height="4" rx="1" fill="#8ce1ff" />
    <path d="M16 10l-3 5h2v5l3-5h-2z" fill="#ffee7d" />
  </svg>
);

const TerminalIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="5" y="5" width="22" height="18" rx="3" fill="#0b1730" stroke="#6fb4ff" strokeWidth="2" />
    <rect x="5" y="23" width="22" height="4" rx="1.5" fill="#1d2d4f" />
    <path d="M10 11l4 3-4 3" stroke="#88f7ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="22" cy="21" r="2" fill="#ff4778" opacity="0.85" />
  </svg>
);

const ICONS: Record<HotbarIconId, IconComponent> = {
  deck: DeckIcon,
  'solar-panel': SolarPanelIcon,
  battery: BatteryIcon,
  terminal: TerminalIcon,
};

export function HotbarIcon({ icon, ...props }: { icon: HotbarIconId } & SVGProps<SVGSVGElement>): JSX.Element {
  const Component = ICONS[icon];
  return <Component {...props} />;
}
