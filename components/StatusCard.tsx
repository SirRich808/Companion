
import React from 'react';
import Icon from './icons';

interface StatusCardProps {
    title: string;
    iconName: React.ComponentProps<typeof Icon>['name'];
    items: string[];
    color?: string;
    isLoading?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, iconName, items, color, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) return null;

    return (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${color}`}>
                <Icon name={iconName} className="w-5 h-5" />
                {title}
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    );
};

export default StatusCard;
