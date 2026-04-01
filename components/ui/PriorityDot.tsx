import { PRIORITY_DOT_COLOR } from "@/types";

interface PriorityDotProps {
    priority: string;
}

export default function PriorityDot({ priority }: PriorityDotProps) {
    return (
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_COLOR[priority]}`} />
    );
}