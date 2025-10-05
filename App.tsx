import React, { useCallback, useState } from 'react';
import { ProjectCreationInput } from './types';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectView from './components/ProjectView';
import { LoginPage } from './components/LoginPage';
import { AILoadingOverlay } from './components/AILoadingOverlay';
import { processUpdate } from './services/geminiService';
import { useProjects } from './hooks/useProjects';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
    const { user, loading } = useAuth();
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const {
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        createProject,
        addProjectUpdate,
        mutateProject,
        deleteProject,
        deleteProjectUpdate,
    } = useProjects();

    const handleAddProject = useCallback(async ({ name, goal, documentContent }: ProjectCreationInput) => {
        try {
            setIsAIProcessing(true);
            const project = await createProject({ name, goal, documentContent });
            setActiveProjectId(project.id);

            if (documentContent) {
                try {
                    console.log('Processing initial document for new project...');
                    const initialState = await processUpdate(documentContent, project);
                    await addProjectUpdate(project.id, {
                        text: documentContent,
                        structuredState: initialState,
                    });
                    console.log('Initial document processed successfully.');
                } catch (error) {
                    console.error('Failed to process initial document:', error);
                    await addProjectUpdate(project.id, {
                        text: documentContent,
                        structuredState: null,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsAIProcessing(false);
        }
    }, [createProject, setActiveProjectId, addProjectUpdate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    if (activeProject) {
        return (
            <>
                <ProjectView
                    project={activeProject}
                    updateProject={mutateProject}
                    addProjectUpdate={addProjectUpdate}
                    deleteProject={deleteProject}
                    deleteProjectUpdate={deleteProjectUpdate}
                    setActiveProjectId={setActiveProjectId}
                />
                <AILoadingOverlay isVisible={isAIProcessing} />
            </>
        );
    }

    return (
        <>
            <ProjectDashboard
                projects={projects}
                setActiveProjectId={setActiveProjectId}
                onAddProject={handleAddProject}
            />
            <AILoadingOverlay isVisible={isAIProcessing} />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
