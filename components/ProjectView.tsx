import React, { useCallback, useState } from 'react';
import { Project, ProjectBriefState, StructuredState, Update } from '../types';
import { processUpdate, generateProjectBrief, generateTags, detectRiskAlerts } from '../services/geminiService';
import UpdateInput from './UpdateInput';
import Icon from './icons';
import ProjectBrief from './ProjectBrief';
import CurrentStatePanel from './CurrentStatePanel';
import ProjectTimeline from './ProjectTimeline';
import TaskExportModal from './TaskExportModal';
import ShareModal from './ShareModal';
import ProjectOverview from './ProjectOverview';
import AllTasksView from './AllTasksView';

interface ProjectViewProps {
    project: Project;
    updateProject: (projectId: string, updater: (project: Project) => Project) => void;
    addProjectUpdate: (projectId: string, payload: { text: string; structuredState: StructuredState | null; tags?: string[] }) => Promise<Update>;
    deleteProject: (projectId: string) => Promise<void>;
    deleteProjectUpdate: (projectId: string, updateId: string) => Promise<void>;
    setActiveProjectId: (id: string | null) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, updateProject, addProjectUpdate, deleteProject, deleteProjectUpdate, setActiveProjectId }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'state' | 'brief' | 'timeline'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [brief, setBrief] = useState<ProjectBriefState | null>(null);
    const [isBriefLoading, setIsBriefLoading] = useState(false);
    const [briefError, setBriefError] = useState<string | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleUpdate = useCallback(async (updateText: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [structuredData, tags] = await Promise.all([
                processUpdate(updateText, project),
                generateTags(updateText)
            ]);
            const previousState = project.currentState;
            const newAlerts = detectRiskAlerts(project.previousState, structuredData);

            await addProjectUpdate(project.id, {
                text: updateText,
                structuredState: structuredData,
                tags,
            });

            updateProject(project.id, prev => ({
                ...prev,
                previousState,
                riskAlerts: newAlerts.length > 0 ? [...(prev.riskAlerts || []).slice(-9), ...newAlerts] : prev.riskAlerts,
            }));
            setBrief(null);
        } catch (err) {
            setError("Sorry, I couldn't process that update. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [project, updateProject, addProjectUpdate]);

    const handleGenerateBrief = useCallback(async () => {
        setIsBriefLoading(true);
        setBriefError(null);
        try {
            const generatedBrief = await generateProjectBrief(project);
            setBrief(generatedBrief);
        } catch (err) {
            console.error("Failed to generate brief:", err);
            setBriefError("Sorry, I couldn't generate the project brief. Please try again.");
        } finally {
            setIsBriefLoading(false);
        }
    }, [project]);

    const handleToggleSharing = useCallback((enabled: boolean) => {
        updateProject(project.id, prev => ({
            ...prev,
            isShared: enabled,
            shareId: enabled && !prev.shareId ? `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : prev.shareId,
        }));
    }, [project.id, updateProject]);

    const handleDeleteUpdate = useCallback(async (updateId: string) => {
        if (!updateId) {
            return;
        }

        try {
            await deleteProjectUpdate(project.id, updateId);
        } catch (err) {
            console.error('Error deleting update:', err);
            setError('Failed to delete update. Please try again.');
        }
    }, [deleteProjectUpdate, project.id]);

    const handleDeleteProject = useCallback(async () => {
        if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteProject(project.id);
            setActiveProjectId(null);
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Failed to delete project. Please try again.');
        }
    }, [deleteProject, project.id, project.name, setActiveProjectId]);

    const exportToMarkdown = useCallback(() => {
        const lines: string[] = [];
        lines.push(`# Project: ${project.name}`, '');
        lines.push(`**Goal:** ${project.goal}`, '');
        lines.push('## Current State Summary');
        lines.push(project.currentState?.statusSummary ?? 'Not yet generated.', '');

        const sectionMap: Record<string, string[] | undefined> = {
            'Next Actions': project.currentState?.nextActions,
            'In Progress': project.currentState?.inProgress,
            Blockers: project.currentState?.blockers,
            Completed: project.currentState?.completed,
            'Decisions Made': project.currentState?.decisionsMade,
            'Ideas Captured': project.currentState?.ideasCaptured,
        };

        Object.entries(sectionMap).forEach(([title, items]) => {
            if (items && items.length > 0) {
                lines.push(`### ${title}`);
                items.forEach(item => lines.push(`- ${item}`));
                lines.push('');
            }
        });

        lines.push('## Full Timeline', '');
        project.updates.forEach(update => {
            lines.push(`**Update from ${new Date(update.timestamp).toLocaleString()}**`, '');
            lines.push(update.text, '', '---', '');
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${project.name.replace(/\s/g, '_')}_export.md`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, [project]);

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col">
            <header className="flex items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10">
                <button onClick={() => setActiveProjectId(null)} className="p-2 rounded-full hover:bg-slate-700 mr-2">
                    <Icon name="arrowLeft" className="w-6 h-6" />
                </button>
                <div className="flex-grow">
                    <h1 className="text-xl font-bold truncate">{project.name}</h1>
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Icon name="target" className="w-4 h-4" /> {project.goal}</p>
                </div>
                <button onClick={() => setShowShareModal(true)} className="p-2 rounded-full hover:bg-slate-700 ml-2" title="Share Project">
                    <Icon name="link" className="w-6 h-6" />
                </button>
                <button onClick={() => setShowExportModal(true)} className="p-2 rounded-full hover:bg-slate-700" title="Export Tasks">
                    <Icon name="share" className="w-6 h-6" />
                </button>
                <button onClick={exportToMarkdown} className="p-2 rounded-full hover:bg-slate-700" title="Export to Markdown">
                    <Icon name="download" className="w-6 h-6" />
                </button>
                <button onClick={handleDeleteProject} className="p-2 rounded-full hover:bg-red-700 text-red-400 hover:text-red-300" title="Delete Project">
                    <Icon name="trash" className="w-6 h-6" />
                </button>
            </header>

            <div className="border-b border-slate-700 px-4 sm:px-6">
                <nav className="flex space-x-4 overflow-x-auto">
                    <button onClick={() => setActiveTab('overview')} className={`py-3 px-1 font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Overview</button>
                    <button onClick={() => setActiveTab('tasks')} className={`py-3 px-1 font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>All Tasks</button>
                    <button onClick={() => setActiveTab('state')} className={`py-3 px-1 font-medium whitespace-nowrap ${activeTab === 'state' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Living Document</button>
                    <button onClick={() => setActiveTab('brief')} className={`py-3 px-1 font-medium whitespace-nowrap ${activeTab === 'brief' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Project Brief</button>
                    <button onClick={() => setActiveTab('timeline')} className={`py-3 px-1 font-medium whitespace-nowrap ${activeTab === 'timeline' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Timeline</button>
                </nav>
            </div>

            <main className="flex-grow overflow-y-auto pb-24 relative">
                {error && <div className="m-4 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}
                
                {/* Overview Tab */}
                <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                    <ProjectOverview project={project} />
                </div>

                {/* All Tasks Tab */}
                <div className={activeTab === 'tasks' ? 'block' : 'hidden'}>
                    <AllTasksView project={project} />
                </div>
                
                {/* Risk Alerts */}
                {project.riskAlerts && project.riskAlerts.length > 0 && activeTab === 'state' && (
                    <div className="mx-4 mt-4 space-y-2">
                        {project.riskAlerts.slice(-3).reverse().map((alert, idx) => (
                            <div 
                                key={idx}
                                className={`p-3 rounded-lg border flex items-start gap-3 ${
                                    alert.severity === 'high' ? 'bg-red-900/30 border-red-700/50' :
                                    alert.severity === 'medium' ? 'bg-orange-900/30 border-orange-700/50' :
                                    'bg-yellow-900/30 border-yellow-700/50'
                                }`}
                            >
                                <Icon 
                                    name="alertTriangle" 
                                    className={`w-5 h-5 mt-0.5 ${
                                        alert.severity === 'high' ? 'text-red-400' :
                                        alert.severity === 'medium' ? 'text-orange-400' :
                                        'text-yellow-400'
                                    }`} 
                                />
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                        alert.severity === 'high' ? 'text-red-300' :
                                        alert.severity === 'medium' ? 'text-orange-300' :
                                        'text-yellow-300'
                                    }`}>
                                        {alert.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className={activeTab === 'state' ? 'block' : 'hidden'}>
                    <CurrentStatePanel currentState={project.currentState} isLoading={isLoading} />
                </div>
                <div className={activeTab === 'brief' ? 'block' : 'hidden'}>
                    <ProjectBrief
                        brief={brief}
                        onGenerate={handleGenerateBrief}
                        isLoading={isBriefLoading}
                        error={briefError}
                    />
                </div>
                <div className={activeTab === 'timeline' ? 'block' : 'hidden'}>
                    <ProjectTimeline updates={project.updates} onDeleteUpdate={handleDeleteUpdate} />
                </div>
            </main>

            <div className={activeTab === 'brief' || activeTab === 'tasks' ? 'hidden' : 'block'}>
              <UpdateInput onUpdate={handleUpdate} isLoading={isLoading} currentState={project.currentState} />
            </div>
            
            <TaskExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                currentState={project.currentState}
                projectName={project.name}
            />
            
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                project={project}
                onToggleSharing={handleToggleSharing}
            />
        </div>
    );
};

export default ProjectView;
