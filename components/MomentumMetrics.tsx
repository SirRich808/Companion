import React, { useMemo } from 'react';
import { Project } from '../types';
import Icon from './icons';

interface MomentumMetricsProps {
    projects: Project[];
}

const MomentumMetrics: React.FC<MomentumMetricsProps> = ({ projects }) => {
    const metrics = useMemo(() => {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        let totalUpdates = 0;
        let recentUpdates = 0;
        let totalCompleted = 0;
        let totalBlockers = 0;
        let totalInProgress = 0;
        let currentStreak = 0;
        let longestStreak = 0;

        // Calculate streak (consecutive days with updates)
        const allUpdateDates = projects
            .flatMap(p => p.updates.map(u => u.timestamp))
            .sort((a, b) => b - a);

        if (allUpdateDates.length > 0) {
            const uniqueDays: string[] = Array.from(
                new Set(
                    allUpdateDates.map((ts: number) => 
                        new Date(ts).toDateString()
                    )
                )
            );

            // Calculate current streak
            let streak = 0;
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            
            for (let i = 0; i < uniqueDays.length; i++) {
                const dayStr = uniqueDays[i];
                const daysDiff = Math.floor((now - new Date(dayStr).getTime()) / (24 * 60 * 60 * 1000));
                if (daysDiff === i || (i === 0 && (uniqueDays[0] === today || uniqueDays[0] === yesterday))) {
                    streak++;
                } else {
                    break;
                }
            }
            currentStreak = streak;

            // Calculate longest streak
            let tempStreak = 1;
            for (let i = 1; i < uniqueDays.length; i++) {
                const prevDayStr = uniqueDays[i - 1];
                const currDayStr = uniqueDays[i];
                const prevDate = new Date(prevDayStr).getTime();
                const currDate = new Date(currDayStr).getTime();
                const daysDiff = Math.floor((prevDate - currDate) / (24 * 60 * 60 * 1000));
                
                if (daysDiff === 1) {
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, currentStreak);
        }

        projects.forEach(project => {
            totalUpdates += project.updates.length;
            recentUpdates += project.updates.filter(u => u.timestamp > sevenDaysAgo).length;

            if (project.currentState) {
                totalCompleted += project.currentState.completed?.length || 0;
                totalBlockers += project.currentState.blockers?.length || 0;
                totalInProgress += project.currentState.inProgress?.length || 0;
            }
        });

        const weeklyVelocity = recentUpdates;
        const completionRate = totalCompleted + totalBlockers > 0 
            ? Math.round((totalCompleted / (totalCompleted + totalBlockers)) * 100)
            : 0;

        return {
            totalUpdates,
            weeklyVelocity,
            completionRate,
            totalCompleted,
            totalBlockers,
            totalInProgress,
            currentStreak,
            longestStreak
        };
    }, [projects]);

    const getStreakEmoji = (streak: number) => {
        if (streak >= 30) return '🏆';
        if (streak >= 14) return '🔥';
        if (streak >= 7) return '⚡';
        if (streak >= 3) return '✨';
        return '🌱';
    };

    return (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Update Streak */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-purple-300">Update Streak</h3>
                    <span className="text-2xl">{getStreakEmoji(metrics.currentStreak)}</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{metrics.currentStreak} days</p>
                <p className="text-xs text-purple-300">Record: {metrics.longestStreak} days</p>
            </div>

            {/* Weekly Velocity */}
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-blue-300">Weekly Updates</h3>
                    <Icon name="trendingUp" className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{metrics.weeklyVelocity}</p>
                <p className="text-xs text-blue-300">Last 7 days</p>
            </div>

            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-green-300">Completion Rate</h3>
                    <Icon name="checkCircle" className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{metrics.completionRate}%</p>
                <p className="text-xs text-green-300">{metrics.totalCompleted} completed, {metrics.totalBlockers} blocked</p>
            </div>

            {/* Active Work */}
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl p-4 border border-orange-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-orange-300">In Progress</h3>
                    <Icon name="loader" className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{metrics.totalInProgress}</p>
                <p className="text-xs text-orange-300">Active tasks across all projects</p>
            </div>
        </div>
    );
};

export default MomentumMetrics;
