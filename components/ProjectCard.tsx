import React, { useState } from 'react';
import { Project } from '../types';
import Icon from './icons';

interface ProjectCardProps {
  project: Project;
  onOpenProject: (id: string) => void;
  isPaused?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject, isPaused = false }) => {
  const [showTasks, setShowTasks] = useState(false);
  
  const lastUpdated = project.updatedAt ?? (project.updates.length > 0 ? project.updates[project.updates.length - 1].timestamp : undefined);
  
  // Extract tasks from current state
  const tasks = project.currentState?.tasks || [];
  const activeTasks = tasks.filter((t: any) => t.status !== 'completed');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.task-toggle')) {
      return; // Don't open project when clicking task toggle
    }
    onOpenProject(project.id);
  };

  const handleTaskToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTasks(!showTasks);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-slate-800 rounded-xl p-6 cursor-pointer border border-slate-700 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-900/50 transition-all duration-300 transform hover:-translate-y-1 ${isPaused ? 'opacity-70 hover:opacity-100 bg-slate-800/60' : ''}`}
    >
      {/* Project Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-white truncate flex-1">{project.name}</h3>
        {tasks.length > 0 && (
          <button
            onClick={handleTaskToggle}
            className="task-toggle ml-2 px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Icon name="checkSquare" className="w-3 h-3" />
            {activeTasks.length}/{tasks.length}
          </button>
        )}
      </div>

      {/* Project Goal */}
      <p className="text-sm text-slate-400 mt-2 line-clamp-2">{project.goal}</p>

      {/* Task Preview Section */}
      {showTasks && tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Active Tasks</h4>
                {activeTasks.slice(0, 5).map((task: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm group">
                    <div className="mt-1">
                      <div className="w-4 h-4 rounded border-2 border-slate-500 group-hover:border-indigo-400 transition-colors"></div>
                    </div>
                    <span className="text-slate-300 text-xs leading-tight flex-1 line-clamp-1">
                      {task.title || task.description}
                    </span>
                  </div>
                ))}
                {activeTasks.length > 5 && (
                  <p className="text-xs text-slate-500 italic ml-6">+{activeTasks.length - 5} more tasks...</p>
                )}
              </div>
            )}

            {/* Completed Tasks (collapsed) */}
            {completedTasks.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-green-400/60 mb-1 flex items-center gap-1">
                  <Icon name="check" className="w-3 h-3" />
                  {completedTasks.length} Completed
                </h4>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject(project.id);
            }}
            className="mt-3 w-full text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-1 py-1 hover:bg-indigo-600/10 rounded transition-colors"
          >
            View all tasks
            <Icon name="arrowRight" className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}
        </p>
        {project.updates.length > 0 && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Icon name="messageSquare" className="w-3 h-3" />
            {project.updates.length} updates
          </span>
        )}
      </div>
    </div>
  );
};
