import React, { useState } from 'react';
import { Project, PortfolioBriefState } from '../types';
import { generatePortfolioBrief } from '../services/geminiService';
import Icon from './icons';

interface PortfolioBriefProps {
    projects: Project[];
}

const PortfolioBrief: React.FC<PortfolioBriefProps> = ({ projects }) => {
    const [brief, setBrief] = useState<PortfolioBriefState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (projects.length === 0) {
            setError("No active projects to analyze");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const generatedBrief = await generatePortfolioBrief(projects);
            setBrief(generatedBrief);
        } catch (err) {
            console.error("Failed to generate portfolio brief:", err);
            setError("Sorry, I couldn't generate the portfolio brief. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-400';
            case 'good': return 'text-blue-400';
            case 'needs-attention': return 'text-orange-400';
            case 'critical': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getMomentumIcon = (momentum: string) => {
        switch (momentum) {
            case 'accelerating': return '🚀';
            case 'steady': return '➡️';
            case 'slowing': return '⚠️';
            default: return '📊';
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
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
                    onClick={handleGenerate}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!brief) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <Icon name="barChart" className="w-16 h-16 text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-300">Portfolio Brief</h2>
                <p className="text-slate-400 mt-2 max-w-md">
                    Generate a comprehensive weekly executive digest that rolls up all active projects into a strategic portfolio view.
                </p>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || projects.length === 0}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <Icon name="zap" className="w-5 h-5" />
                    Generate Portfolio Brief
                </button>
                {projects.length === 0 && (
                    <p className="text-sm text-slate-500 mt-3">Create some projects first to generate a portfolio brief</p>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Portfolio Brief</h1>
                        <p className="text-slate-400">Week of {new Date().toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-800"
                        title="Refresh Portfolio Brief"
                    >
                        <Icon name={isLoading ? 'loader' : 'zap'} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Health & Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Overall Health</p>
                        <p className={`text-2xl font-bold ${getHealthColor(brief.overallHealth)}`}>
                            {brief.overallHealth.replace('-', ' ')}
                        </p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Active Projects</p>
                        <p className="text-2xl font-bold text-white">{brief.activeProjectCount}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Completion Rate</p>
                        <p className="text-2xl font-bold text-green-400">{brief.weeklyMetrics.completionRate}%</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Momentum</p>
                        <p className="text-2xl font-bold text-white">
                            {getMomentumIcon(brief.weeklyMetrics.momentum)} {brief.weeklyMetrics.momentum}
                        </p>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                    <h2 className="text-xl font-bold text-white mb-3">Executive Summary</h2>
                    <p className="text-slate-300 leading-relaxed">{brief.portfolioSummary}</p>
                </div>

                {/* Project Highlights */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Project Highlights</h2>
                    <div className="space-y-3">
                        {brief.projectHighlights.map((highlight, idx) => (
                            <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-white">{highlight.projectName}</h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                        {highlight.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">{highlight.keyUpdate}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategic Priorities */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Strategic Priorities</h2>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <ul className="space-y-2">
                            {brief.strategicPriorities.map((priority, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-300">
                                    <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                                    {priority}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Cross-Project Risks */}
                {brief.crossProjectRisks.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Cross-Project Risks</h2>
                        <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
                            <ul className="space-y-2">
                                {brief.crossProjectRisks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-orange-300">
                                        <Icon name="alertTriangle" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioBrief;
