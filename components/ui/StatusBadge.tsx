interface StatusBadgeProps {
    label: string;
    color: string;
}

export default function StatusBadge({ label, color }: StatusBadgeProps) {
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
            {label}
        </span>
    );
}