import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import Icon from './icons';

interface AllTasksViewProps {
    project: Project;
}

type TaskFilter = 'all' | 'active' | 'completed' | 'blocked';

const AllTasksView: React.FC<AllTasksViewProps> = ({ project }) => {
    const [filter, setFilter] = useState<TaskFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const allTasks = useMemo(() => {
        const tasks: Array<{
            text: string;
            status: 'inProgress' | 'nextActions' | 'blockers' | 'completed';
            category: string;
        }> = [];

        // In Progress
        project.currentState?.inProgress?.forEach(task => {
            tasks.push({ text: task, status: 'inProgress', category: 'In Progress' });
        });

        // Next Actions
        project.currentState?.nextActions?.forEach(task => {
            tasks.push({ text: task, status: 'nextActions', category: 'Next Actions' });
        });

        // Blockers
        project.currentState?.blockers?.forEach(task => {
            tasks.push({ text: task, status: 'blockers', category: 'Blocked' });
        });

        // Completed
        project.currentState?.completed?.forEach(task => {
            tasks.push({ text: task, status: 'completed', category: 'Completed' });
        });

        return tasks;
    }, [project.currentState]);

    const filteredTasks = useMemo(() => {
        let filtered = allTasks;

        // Apply status filter
        if (filter === 'active') {
            filtered = filtered.filter(t => t.status === 'inProgress' || t.status === 'nextActions');
        } else if (filter === 'completed') {
            filtered = filtered.filter(t => t.status === 'completed');
        } else if (filter === 'blocked') {
            filtered = filtered.filter(t => t.status === 'blockers');
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(t => 
                t.text.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allTasks, filter, searchQuery]);

    const taskCounts = useMemo(() => ({
        all: allTasks.length,
        active: allTasks.filter(t => t.status === 'inProgress' || t.status === 'nextActions').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        blocked: allTasks.filter(t => t.status === 'blockers').length,
    }), [allTasks]);

    const getTaskStyle = (status: string) => {
        switch (status) {
            case 'inProgress':
                return {
                    border: 'border-blue-700/30',
                    bg: 'bg-blue-900/20',
                    icon: (
                        <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-sm animate-pulse"></div>
                        </div>
                    ),
                    text: 'text-slate-200'
                };
            case 'nextActions':
                return {
                    border: 'border-slate-700',
                    bg: 'bg-slate-900',
                    icon: <div className="w-5 h-5 rounded border-2 border-slate-500"></div>,
                    text: 'text-slate-300'
                };
            case 'blockers':
                return {
                    border: 'border-red-700/30',
                    bg: 'bg-red-900/20',
                    icon: <Icon name="alertTriangle" className="w-5 h-5 text-red-400" />,
                    text: 'text-red-200'
                };
            case 'completed':
                return {
                    border: 'border-green-700/30',
                    bg: 'bg-slate-900',
                    icon: (
                        <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                            <Icon name="check" className="w-3 h-3 text-white" />
                        </div>
                    ),
                    text: 'text-slate-400 line-through'
                };
            default:
                return {
                    border: 'border-slate-700',
                    bg: 'bg-slate-900',
                    icon: <div className="w-5 h-5 rounded border-2 border-slate-500"></div>,
                    text: 'text-slate-300'
                };
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">All Tasks</h2>
                    <p className="text-slate-400">Complete task reference for {project.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Icon name="checkSquare" className="w-5 h-5" />
                    <span>{filteredTasks.length} of {taskCounts.all} tasks</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'all'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    All Tasks <span className="ml-1 text-xs opacity-75">({taskCounts.all})</span>
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    Active <span className="ml-1 text-xs opacity-75">({taskCounts.active})</span>
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    Completed <span className="ml-1 text-xs opacity-75">({taskCounts.completed})</span>
                </button>
                <button
                    onClick={() => setFilter('blocked')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'blocked'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    Blocked <span className="ml-1 text-xs opacity-75">({taskCounts.blocked})</span>
                </button>
            </div>

            {/* Task List */}
            {filteredTasks.length > 0 ? (
                <div className="space-y-2">
                    {filteredTasks.map((task, idx) => {
                        const style = getTaskStyle(task.status);
                        return (
                            <div
                                key={idx}
                                className={`group flex items-start gap-3 p-4 rounded-lg border ${style.border} ${style.bg} hover:border-indigo-500/50 transition-all cursor-pointer`}
                            >
                                <div className="mt-0.5">{style.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${style.text}`}>{task.text}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                        {task.category}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-800 rounded-xl border border-slate-700">
                    <Icon name="search" className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                        {searchQuery ? 'No tasks found' : 'No tasks yet'}
                    </h3>
                    <p className="text-slate-500">
                        {searchQuery 
                            ? 'Try adjusting your search or filter'
                            : 'Add project updates to generate tasks'
                        }
                    </p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{taskCounts.active}</div>
                    <div className="text-xs text-slate-500">Active Tasks</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{taskCounts.completed}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{taskCounts.blocked}</div>
                    <div className="text-xs text-slate-500">Blocked</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">
                        {taskCounts.completed > 0 ? Math.round((taskCounts.completed / taskCounts.all) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-500">Progress</div>
                </div>
            </div>
        </div>
    );
};

export default AllTasksView;
