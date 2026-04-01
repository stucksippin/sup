interface AvatarProps {
    name: string;
    size?: "sm" | "md";
    className?: string;
}

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
    const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
    return (
        <div
            className={`${sizeClass} bg-blue-500 rounded-full flex items-center justify-center text-white font-medium border-2 border-white ${className}`}
            title={name}
        >
            {name[0]}
        </div>
    );
}