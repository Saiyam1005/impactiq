const badgeConfig = {
    "MATCH WINNER": { bg: '#F0B429', text: '#060B18', icon: '🏆' },
    "CHASE MASTER": { bg: '#00E5FF', text: '#060B18', icon: '🎯' },
    "PRESSURE PROOF": { bg: '#8B5CF6', text: '#F0F4FF', icon: '⚡' },
    "IN FORM": { bg: '#00D68F', text: '#060B18', icon: '🔥' },
    "DEATH SPECIALIST": { bg: '#F7645A', text: '#F0F4FF', icon: '💀' },
    "CONSISTENT": { bg: '#1E3A5F', text: '#F0F4FF', icon: '🧊' },
    "CLUTCH BOWLER": { bg: '#7C3AED', text: '#F0F4FF', icon: '🎳' },
    "SPIN WIZARD": { bg: '#FFAA00', text: '#060B18', icon: '🌀' },
    "FORM DIP": { bg: '#4A5E7A', text: '#F0F4FF', icon: '⬇️' },
    "CRISIS": { bg: '#991B1B', text: '#F0F4FF', icon: '⚠️' },
};

const sizeMap = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
};

export default function IMBadge({ badge, size = 'md' }) {
    const config = badgeConfig[badge] || { bg: '#1C2D4A', text: '#F0F4FF', icon: '📊' };
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-bold font-body whitespace-nowrap ${sizeMap[size]}`}
            style={{ backgroundColor: config.bg, color: config.text }}
        >
            <span>{config.icon}</span>
            {badge}
        </span>
    );
}
