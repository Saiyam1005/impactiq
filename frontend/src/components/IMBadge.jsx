import { FiAward, FiTarget, FiZap, FiTrendingUp, FiCrosshair, FiAnchor, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';
import { LuSkull, LuSnowflake, LuWand } from 'react-icons/lu';
import { MdSportsCricket } from 'react-icons/md';
import { GiPowerLightning, GiAnchor } from 'react-icons/gi';

const badgeConfig = {
    "MATCH WINNER": { bg: '#F0B429', text: '#060B18', Icon: FiAward },
    "CHASE MASTER": { bg: '#00E5FF', text: '#060B18', Icon: FiTarget },
    "PRESSURE PROOF": { bg: '#8B5CF6', text: '#F0F4FF', Icon: FiZap },
    "IN FORM": { bg: '#00D68F', text: '#060B18', Icon: FiTrendingUp },
    "DEATH SPECIALIST": { bg: '#F7645A', text: '#F0F4FF', Icon: LuSkull },
    "CONSISTENT": { bg: '#1E3A5F', text: '#F0F4FF', Icon: LuSnowflake },
    "CLUTCH BOWLER": { bg: '#7C3AED', text: '#F0F4FF', Icon: MdSportsCricket },
    "SPIN WIZARD": { bg: '#FFAA00', text: '#060B18', Icon: LuWand },
    "FORM DIP": { bg: '#4A5E7A', text: '#F0F4FF', Icon: FiChevronDown },
    "CRISIS": { bg: '#991B1B', text: '#F0F4FF', Icon: FiAlertTriangle },
    "POWER HITTER": { bg: '#FF6B35', text: '#F0F4FF', Icon: GiPowerLightning },
    "ANCHOR": { bg: '#3B82F6', text: '#F0F4FF', Icon: GiAnchor },
    "NEW BALL MENACE": { bg: '#EF4444', text: '#F0F4FF', Icon: FiCrosshair },
};

const sizeMap = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
};

const iconSizeMap = {
    sm: 10,
    md: 12,
    lg: 14,
};

export default function IMBadge({ badge, size = 'md' }) {
    const config = badgeConfig[badge] || { bg: '#1C2D4A', text: '#F0F4FF', Icon: FiZap };
    const { Icon } = config;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-bold font-body whitespace-nowrap ${sizeMap[size]}`}
            style={{ backgroundColor: config.bg, color: config.text }}
        >
            <Icon size={iconSizeMap[size]} />
            {badge}
        </span>
    );
}
