import React, { useMemo, useState } from 'react';
import { Project, ProjectCreationInput } from '../types';
import NewProjectModal from './NewProjectModal';
import MomentumMetrics from './MomentumMetrics';
import PortfolioBrief from './PortfolioBrief';
import Icon from './icons';
import { UserMenu } from './UserMenu';
import { ProjectCard } from './ProjectCard';

interface ProjectDashboardProps {
    projects: Project[];
    setActiveProjectId: (id: string | null) => void;
    onAddProject: (project: ProjectCreationInput) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, setActiveProjectId, onAddProject }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPortfolioBrief, setShowPortfolioBrief] = useState(false);
    const { active: activeProjects, paused: pausedProjects } = useMemo(() => {
        return projects.reduce(
            (acc, project) => {
                if (project.status === 'paused') {
                    acc.paused.push(project);
                } else {
                    acc.active.push(project);
                }
                return acc;
            },
            { active: [] as Project[], paused: [] as Project[] }
        );
    }, [projects]);

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className='flex items-center gap-2'>
                    <Icon name="zap" className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-3xl font-bold tracking-tight">Project Companion</h1>
                </div>
                <div className="flex items-center gap-3">
                    {projects.length > 0 && (
                        <button
                            onClick={() => setShowPortfolioBrief(!showPortfolioBrief)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-all duration-200"
                        >
                            <Icon name="barChart" className="w-5 h-5" />
                            {showPortfolioBrief ? 'Show Projects' : 'Portfolio Brief'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        New Project
                    </button>
                    <UserMenu />
                </div>
            </header>

            <main>
                {showPortfolioBrief ? (
                    <PortfolioBrief projects={projects.filter(p => p.status === 'active')} />
                ) : (
                    <>
                        {/* Momentum Dashboard */}
                        {projects.length > 0 && <MomentumMetrics projects={projects} />}
                        <section>
                    <h2 className="text-xl font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Active Projects</h2>
                    {activeProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onOpenProject={setActiveProjectId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
                            <p className="text-slate-400">No active projects yet.</p>
                            <p className="text-slate-500 text-sm">Click "New Project" to get started!</p>
                        </div>
                    )}
                </section>

                {pausedProjects.length > 0 && (
                    <section className="mt-12">
                         <h2 className="text-xl font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                           <Icon name="archive" className="w-5 h-5" /> Paused Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pausedProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onOpenProject={setActiveProjectId}
                                    isPaused={true}
                                />
                            ))}
                        </div>
                    </section>
                )}
                    </>
                )}
            </main>
            <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddProject={onAddProject} />
        </div>
    );
};

export default ProjectDashboard;
