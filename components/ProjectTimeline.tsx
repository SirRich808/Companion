import React, { useState, useMemo } from 'react';
import { Update } from '../types';
import Icon from './icons';

interface ProjectTimelineProps {
    updates: Update[];
    onDeleteUpdate?: (updateId: string) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ updates, onDeleteUpdate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Extract all unique tags from updates
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        updates.forEach(update => {
            update.tags?.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [updates]);

    // Filter updates based on search and selected tags
    const filteredUpdates = useMemo(() => {
        return updates.filter(update => {
            const matchesSearch = searchQuery === '' || 
                update.text.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.some(tag => update.tags?.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [updates, searchQuery, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Project Timeline</h2>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search updates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-2">Filter by tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        selectedTags.includes(tag)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 hover:bg-red-900/70"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Results count */}
                <p className="text-sm text-slate-500">
                    Showing {filteredUpdates.length} of {updates.length} update{updates.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Timeline */}
            {filteredUpdates.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
                    <Icon name="search" className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No updates found matching your filters.</p>
                </div>
            ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[8.75rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                    {[...filteredUpdates].reverse().map(update => (
                        <div key={update.timestamp} className="relative">
                            <div className="md:flex items-center md:gap-8">
                                <div className="flex items-center mb-2 md:mb-0">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-slate-400 shrink-0 md:order-1 md:w-12 md:h-12">
                                        <Icon name="clock" className="w-5 h-5" />
                                    </div>
                                    <div className="md:w-48 ml-4 md:ml-0 md:text-right">
                                        <p className="font-semibold text-slate-300">{new Date(update.timestamp).toLocaleDateString()}</p>
                                        <p className="text-sm text-slate-500">{new Date(update.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="text-slate-300 whitespace-pre-wrap flex-1">{update.text}</p>
                                        {onDeleteUpdate && (
                                            <button
                                                onClick={() => confirm('Delete this update?') && onDeleteUpdate(update.id)}
                                                className="ml-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                title="Delete update"
                                            >
                                                <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {update.tags && update.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700">
                                            {update.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-slate-900 text-indigo-400 text-xs rounded-full border border-slate-600"
                                                >
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
            )}
        </div>
    );
};

export default ProjectTimeline;
