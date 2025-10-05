import React, { useMemo } from 'react';
import { Project } from '../types';
import Icon from './icons';

interface ProjectOverviewProps {
    project: Project;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
    const metrics = useMemo(() => {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const recentUpdates = project.updates.filter(u => u.timestamp > sevenDaysAgo);
        const monthlyUpdates = project.updates.filter(u => u.timestamp > thirtyDaysAgo);

        const totalTasks = (project.currentState?.completed?.length || 0) +
                          (project.currentState?.inProgress?.length || 0) +
                          (project.currentState?.blockers?.length || 0) +
                          (project.currentState?.nextActions?.length || 0);

        const completedTasks = project.currentState?.completed?.length || 0;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Activity by day of week
        const activityByDay = Array(7).fill(0);
        project.updates.forEach(update => {
            const day = new Date(update.timestamp).getDay();
            activityByDay[day]++;
        });

        // Tag frequency
        const tagFrequency: Record<string, number> = {};
        project.updates.forEach(update => {
            update.tags?.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        // Activity trend (last 7 days)
        const last7Days = Array(7).fill(0).map((_, i) => {
            const date = new Date(now - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
            const count = project.updates.filter(u => u.timestamp >= dayStart && u.timestamp <= dayEnd).length;
            return { date: new Date(dayStart), count };
        }).reverse();

        // Health score calculation
        const blockerCount = project.currentState?.blockers?.length || 0;
        const recentActivity = recentUpdates.length;
        const hasRisks = (project.riskAlerts?.length || 0) > 0;
        
        let healthScore = 100;
        healthScore -= blockerCount * 10;
        healthScore -= recentActivity === 0 ? 30 : 0;
        healthScore -= hasRisks ? 20 : 0;
        healthScore = Math.max(0, Math.min(100, healthScore));

        const getHealthStatus = (score: number): { label: string; color: string } => {
            if (score >= 80) return { label: 'Excellent', color: 'text-green-400' };
            if (score >= 60) return { label: 'Good', color: 'text-blue-400' };
            if (score >= 40) return { label: 'Needs Attention', color: 'text-orange-400' };
            return { label: 'Critical', color: 'text-red-400' };
        };

        return {
            totalUpdates: project.updates.length,
            recentUpdates: recentUpdates.length,
            monthlyUpdates: monthlyUpdates.length,
            totalTasks,
            completedTasks,
            progressPercentage,
            blockerCount,
            inProgressCount: project.currentState?.inProgress?.length || 0,
            nextActionsCount: project.currentState?.nextActions?.length || 0,
            activityByDay,
            topTags,
            last7Days,
            healthScore,
            healthStatus: getHealthStatus(healthScore),
            daysSinceCreation: Math.floor((now - (project.updates[0]?.timestamp || now)) / (24 * 60 * 60 * 1000)),
            avgUpdatesPerWeek: project.updates.length > 0 
                ? Math.round((project.updates.length / Math.max(1, Math.floor((now - project.updates[0].timestamp) / (7 * 24 * 60 * 60 * 1000)))) * 10) / 10
                : 0
        };
    }, [project]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Project Overview</h2>
                    <p className="text-slate-400">Comprehensive insights and analytics for {project.name}</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${metrics.healthStatus.color}`}>
                        {metrics.healthScore}%
                    </div>
                    <div className="text-sm text-slate-400">{metrics.healthStatus.label}</div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="calendar" className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-semibold text-blue-300">Total Updates</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{metrics.totalUpdates}</p>
                    <p className="text-xs text-blue-300 mt-1">~{metrics.avgUpdatesPerWeek}/week avg</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="clock" className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-semibold text-purple-300">Project Age</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{metrics.daysSinceCreation}</p>
                    <p className="text-xs text-purple-300 mt-1">days active</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="checkCircle" className="w-5 h-5 text-green-400" />
                        <h3 className="text-sm font-semibold text-green-300">Completed</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{metrics.completedTasks}</p>
                    <p className="text-xs text-green-300 mt-1">{metrics.progressPercentage}% progress</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl p-4 border border-orange-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="alertTriangle" className="w-5 h-5 text-orange-400" />
                        <h3 className="text-sm font-semibold text-orange-300">Blockers</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{metrics.blockerCount}</p>
                    <p className="text-xs text-orange-300 mt-1">need attention</p>
                </div>
            </div>

            {/* Progress Visualization */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Task Distribution</h3>
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Overall Progress</span>
                            <span className="text-slate-400">{metrics.progressPercentage}%</span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                                style={{ width: `${metrics.progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Task Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-900 rounded-lg p-3 border border-green-700/50">
                            <div className="text-green-400 text-2xl font-bold">{metrics.completedTasks}</div>
                            <div className="text-xs text-slate-400">Completed</div>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-3 border border-blue-700/50">
                            <div className="text-blue-400 text-2xl font-bold">{metrics.inProgressCount}</div>
                            <div className="text-xs text-slate-400">In Progress</div>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-3 border border-indigo-700/50">
                            <div className="text-indigo-400 text-2xl font-bold">{metrics.nextActionsCount}</div>
                            <div className="text-xs text-slate-400">Next Actions</div>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-3 border border-red-700/50">
                            <div className="text-red-400 text-2xl font-bold">{metrics.blockerCount}</div>
                            <div className="text-xs text-slate-400">Blocked</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Trend */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="trendingUp" className="w-5 h-5 text-indigo-400" />
                        7-Day Activity
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-32">
                        {metrics.last7Days.map((day, idx) => {
                            const maxCount = Math.max(...metrics.last7Days.map(d => d.count), 1);
                            const height = (day.count / maxCount) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-slate-700 rounded-t relative group cursor-pointer" style={{ height: `${height}%`, minHeight: '4px' }}>
                                        <div className="w-full h-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t" />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {day.count} update{day.count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {day.date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-sm text-slate-400 text-center">
                        {metrics.recentUpdates} updates in the last 7 days
                    </div>
                </div>

                {/* Activity by Day of Week */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="calendar" className="w-5 h-5 text-purple-400" />
                        Activity Patterns
                    </h3>
                    <div className="space-y-2">
                        {dayNames.map((day, idx) => {
                            const count = metrics.activityByDay[idx];
                            const maxCount = Math.max(...metrics.activityByDay, 1);
                            const width = (count / maxCount) * 100;
                            return (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-12 text-sm text-slate-400">{day}</div>
                                    <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-end px-2"
                                            style={{ width: `${Math.max(width, count > 0 ? 15 : 0)}%` }}
                                        >
                                            {count > 0 && <span className="text-xs font-semibold text-white">{count}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tag Cloud */}
            {metrics.topTags.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="tag" className="w-5 h-5 text-cyan-400" />
                        Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {metrics.topTags.map(([tag, count]) => {
                            const maxCount = metrics.topTags[0][1];
                            const size = Math.max(0.75, (count / maxCount));
                            return (
                                <div
                                    key={tag}
                                    className="px-4 py-2 bg-cyan-900/30 border border-cyan-700/50 rounded-full text-cyan-300 hover:bg-cyan-900/50 transition-all cursor-pointer"
                                    style={{ fontSize: `${size}rem` }}
                                >
                                    #{tag} <span className="text-cyan-500 text-xs ml-1">×{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Interactive Task Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active & Upcoming Tasks */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="checkSquare" className="w-5 h-5 text-indigo-400" />
                        Active & Upcoming Tasks
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {/* In Progress */}
                        {project.currentState?.inProgress && project.currentState.inProgress.length > 0 && (
                            <>
                                <h4 className="text-sm font-semibold text-blue-400 mb-2 sticky top-0 bg-slate-800 py-1">In Progress</h4>
                                {project.currentState.inProgress.map((task, idx) => (
                                    <div key={`progress-${idx}`} className="group flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-blue-700/30 hover:border-blue-500/50 transition-all cursor-pointer">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-blue-400 rounded-sm animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-200">{task}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        
                        {/* Next Actions */}
                        {project.currentState?.nextActions && project.currentState.nextActions.length > 0 && (
                            <>
                                <h4 className="text-sm font-semibold text-indigo-400 mb-2 mt-4 sticky top-0 bg-slate-800 py-1">Next Actions</h4>
                                {project.currentState.nextActions.map((task, idx) => (
                                    <div key={`next-${idx}`} className="group flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded border-2 border-slate-500 group-hover:border-indigo-400 transition-colors"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{task}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        
                        {(!project.currentState?.inProgress?.length && !project.currentState?.nextActions?.length) && (
                            <div className="text-center py-8 text-slate-500">
                                <Icon name="checkSquare" className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No active tasks yet</p>
                                <p className="text-xs mt-1">Add an update to generate tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Blockers & Completed */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="alertTriangle" className="w-5 h-5 text-orange-400" />
                        Blockers & Completed
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {/* Blockers */}
                        {project.currentState?.blockers && project.currentState.blockers.length > 0 && (
                            <>
                                <h4 className="text-sm font-semibold text-red-400 mb-2 sticky top-0 bg-slate-800 py-1">Blocked</h4>
                                {project.currentState.blockers.map((blocker, idx) => (
                                    <div key={`blocker-${idx}`} className="group flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-700/30 hover:border-red-500/50 transition-all cursor-pointer">
                                        <div className="mt-1">
                                            <Icon name="alertTriangle" className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-red-200">{blocker}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        
                        {/* Completed */}
                        {project.currentState?.completed && project.currentState.completed.length > 0 && (
                            <>
                                <h4 className="text-sm font-semibold text-green-400 mb-2 mt-4 sticky top-0 bg-slate-800 py-1">Recently Completed</h4>
                                {project.currentState.completed.slice(-5).reverse().map((task, idx) => (
                                    <div key={`done-${idx}`} className="group flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-green-700/30 opacity-60 hover:opacity-100 transition-all">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                                                <Icon name="check" className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-400 line-through">{task}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        
                        {(!project.currentState?.blockers?.length && !project.currentState?.completed?.length) && (
                            <div className="text-center py-8 text-slate-500">
                                <Icon name="check" className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Nothing to show here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Icon name="clock" className="w-5 h-5 text-slate-400" />
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {project.updates.slice(-5).reverse().map((update, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-300 line-clamp-2">{update.text}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-500">
                                        {new Date(update.timestamp).toLocaleDateString()} at {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {update.tags && update.tags.length > 0 && (
                                        <div className="flex gap-1">
                                            {update.tags.slice(0, 2).map((tag, tagIdx) => (
                                                <span key={tagIdx} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600">
                    <Icon name="zap" className="w-8 h-8 text-yellow-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Velocity</h4>
                    <p className="text-sm text-slate-300">
                        {metrics.recentUpdates > 5 ? 'High momentum' : metrics.recentUpdates > 2 ? 'Steady progress' : 'Low activity'} this week
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600">
                    <Icon name="target" className="w-8 h-8 text-green-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Focus</h4>
                    <p className="text-sm text-slate-300">
                        {metrics.inProgressCount} active {metrics.inProgressCount === 1 ? 'task' : 'tasks'}, {metrics.nextActionsCount} queued
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600">
                    <Icon name="trendingUp" className="w-8 h-8 text-blue-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Completion Rate</h4>
                    <p className="text-sm text-slate-300">
                        {metrics.progressPercentage}% of all tasks completed
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;
