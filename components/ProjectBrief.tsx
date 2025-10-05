import React from 'react';
import Icon from './icons';
import { ProjectBriefState } from '../types';

interface ProjectBriefProps {
    brief: ProjectBriefState | null;
    onGenerate: () => void;
    isLoading: boolean;
    error: string | null;
}

const BriefSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4">{title}</h2>
            <div className="text-slate-300 space-y-2">{children}</div>
        </div>
    );
};

const BulletList: React.FC<{ items: string[] | undefined }> = ({ items }) => {
    if (!items || items.length === 0) {
        return <p className="text-slate-500 italic">None provided.</p>;
    }
    return (
        <ul className="list-disc list-inside space-y-1">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    );
};


const ProjectBrief: React.FC<ProjectBriefProps> = ({ brief, onGenerate, isLoading, error }) => {

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
                <div className="h-6 bg-slate-700 rounded w-1/4 mt-6 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <Icon name="alertTriangle" className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-400">Generation Failed</h2>
                <p className="text-slate-400 mt-2 max-w-md">{error}</p>
                 <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 disabled:bg-slate-600"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!brief) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <Icon name="fileText" className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-300">Project Brief</h2>
                <p className="text-slate-400 mt-2 max-w-md">Generate a comprehensive, professional summary of the entire project based on its goal and complete timeline.</p>
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:bg-slate-600"
                >
                    <Icon name={isLoading ? 'loader' : 'zap'} className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Generating...' : 'Generate Brief'}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <style>
                {`
                    @media print {
                        body { background-color: white; color: black; }
                        .no-print { display: none; }
                        .printable-area {
                            padding: 0;
                        }
                        .print-header { color: black !important; }
                        .print-text { color: #333 !important; }
                        .print-border { border-color: #ccc !important; }
                    }
                `}
            </style>
            <div className="max-w-4xl mx-auto printable-area">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white print-header">{brief.projectName}</h1>
                        <p className="text-indigo-400 print-text">{brief.projectGoal}</p>
                    </div>
                    <div className="no-print flex gap-2">
                         <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-800"
                            title="Refresh Brief"
                        >
                            <Icon name={isLoading ? 'loader' : 'zap'} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
                            title="Print Brief"
                        >
                            <Icon name="printer" className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="space-y-8">
                    <BriefSection title="Executive Summary">
                        <p className="print-text">{brief.executiveSummary}</p>
                    </BriefSection>
                    
                    <BriefSection title="Key Accomplishments">
                        <BulletList items={brief.keyAccomplishments} />
                    </BriefSection>

                    <BriefSection title="Current Focus">
                        <BulletList items={brief.currentFocus} />
                    </BriefSection>

                    <BriefSection title="Identified Risks & Blockers">
                        <BulletList items={brief.identifiedRisksAndBlockers} />
                    </BriefSection>

                    <BriefSection title="Strategic Recommendations">
                        <BulletList items={brief.strategicRecommendations} />
                    </BriefSection>

                    <BriefSection title="Open Questions">
                        <BulletList items={brief.openQuestions} />
                    </BriefSection>
                </div>
            </div>
        </div>
    );
};

export default ProjectBrief;