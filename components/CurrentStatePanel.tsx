import React, { useMemo, useState } from 'react';
import { StructuredState, TaskItem } from '../types';
import StatusCard from './StatusCard';
import Icon from './icons';
import { enrichNextActions } from '../services/geminiService';

interface CurrentStatePanelProps {
    currentState: StructuredState | null;
    isLoading: boolean;
}

const CurrentStatePanel: React.FC<CurrentStatePanelProps> = ({ currentState, isLoading }) => {
    const [enrichedActions, setEnrichedActions] = useState<TaskItem[] | null>(null);
    const [isEnriching, setIsEnriching] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(false);

    const hasState = useMemo(() => {
        if (!currentState) {
            return false;
        }

        return Object.values(currentState).some(value =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
        );
    }, [currentState]);

    const handleEnrichActions = async () => {
        if (!currentState || currentState.nextActions.length === 0) return;
        
        setIsEnriching(true);
        try {
            const actions = Array.isArray(currentState.nextActions) 
                ? currentState.nextActions.map(a => typeof a === 'string' ? a : a.task)
                : [];
            
            const enriched = await enrichNextActions(
                actions,
                currentState.blockers || [],
                currentState.inProgress || []
            );
            setEnrichedActions(enriched);
            setShowRoadmap(true);
        } catch (error) {
            console.error("Failed to enrich actions:", error);
        } finally {
            setIsEnriching(false);
        }
    };

    const getEffortColor = (effort?: string) => {
        switch (effort) {
            case 'low': return 'text-green-400 bg-green-900/30 border-green-700/50';
            case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50';
            case 'high': return 'text-red-400 bg-red-900/30 border-red-700/50';
            default: return 'text-slate-400 bg-slate-800 border-slate-700';
        }
    };

    const getEffortLabel = (effort?: string) => {
        switch (effort) {
            case 'low': return '~1-2h';
            case 'medium': return '~2-8h';
            case 'high': return '~8h+';
            default: return '~';
        }
    };

    if (!hasState && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <Icon name="zap" className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-300">Living Document</h2>
                <p className="text-slate-400 mt-2 max-w-md">
                    This dashboard will automatically update after your first input. Use the text box below to add your first project
                    update.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {isLoading && !hasState && (
                <div className="p-4 sm:p-6 space-y-6">
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <StatusCard title="" iconName="zap" items={[]} isLoading={true} />
                        <StatusCard title="" iconName="zap" items={[]} isLoading={true} />
                    </div>
                </div>
            )}

            {hasState && currentState && (
                <>
                    {currentState.emotionalFeedback && (
                        <div className="bg-indigo-900/40 border border-indigo-700/60 rounded-lg p-4 flex items-start gap-3">
                            <Icon name="messageSquare" className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                            <p className="text-indigo-200">"{currentState.emotionalFeedback}"</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Status Summary</h3>
                        <p className="text-slate-400">{currentState.statusSummary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <StatusCard title="Next Actions" iconName="rocket" items={currentState.nextActions} color="text-green-400" />
                        <StatusCard title="In Progress" iconName="loader" items={currentState.inProgress} color="text-yellow-400" />
                        <StatusCard title="Blockers" iconName="alertTriangle" items={currentState.blockers} color="text-red-400" />
                        <StatusCard title="Completed" iconName="checkCircle" items={currentState.completed} color="text-blue-400" />
                        <StatusCard title="Decisions Made" iconName="target" items={currentState.decisionsMade} color="text-purple-400" />
                        <StatusCard title="Ideas Captured" iconName="lightbulb" items={currentState.ideasCaptured} color="text-cyan-400" />
                    </div>

                    {currentState.clarifyingQuestion && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-start gap-3">
                            <span className="text-2xl font-bold text-slate-500">?</span>
                            <p className="text-slate-300 italic">"{currentState.clarifyingQuestion}"</p>
                        </div>
                    )}

                    {/* Roadmap Generator */}
                    {currentState.nextActions && currentState.nextActions.length > 0 && (
                        <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Icon name="rocket" className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-semibold text-indigo-300">Smart Roadmap</h3>
                                </div>
                                <button
                                    onClick={() => showRoadmap ? setShowRoadmap(false) : handleEnrichActions()}
                                    disabled={isEnriching}
                                    className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isEnriching ? (
                                        <>
                                            <Icon name="loader" className="w-4 h-4" />
                                            Analyzing...
                                        </>
                                    ) : showRoadmap ? (
                                        'Hide Roadmap'
                                    ) : (
                                        <>
                                            <Icon name="zap" className="w-4 h-4" />
                                            Generate Roadmap
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-indigo-200/80">
                                AI-powered effort estimates and dependency mapping for your next actions
                            </p>

                            {showRoadmap && enrichedActions && enrichedActions.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {enrichedActions.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <p className="text-slate-200 flex-1">{item.task}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${getEffortColor(item.effort)}`}>
                                                    {getEffortLabel(item.effort)}
                                                </span>
                                            </div>
                                            {item.dependencies && item.dependencies.length > 0 && (
                                                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-700">
                                                    <Icon name="alertTriangle" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500 mb-1">Depends on:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.dependencies.map((dep, depIdx) => (
                                                                <span key={depIdx} className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded border border-orange-700/50">
                                                                    {dep}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CurrentStatePanel;
