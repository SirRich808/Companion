import React, { useState } from 'react';
import { StructuredState } from '../types';
import Icon from './icons';

interface TaskExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentState: StructuredState | null;
    projectName: string;
}

const TaskExportModal: React.FC<TaskExportModalProps> = ({ isOpen, onClose, currentState, projectName }) => {
    const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'csv' | 'json' | 'todoist'>('markdown');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    if (!isOpen || !currentState) return null;

    const allTasks = [
        ...(currentState.nextActions || []).map(task => ({ task, type: 'Next Action' })),
        ...(currentState.inProgress || []).map(task => ({ task, type: 'In Progress' })),
    ];

    const toggleTask = (task: string) => {
        setSelectedTasks(prev => 
            prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
        );
    };

    const selectAll = () => {
        setSelectedTasks(allTasks.map(t => t.task));
    };

    const deselectAll = () => {
        setSelectedTasks([]);
    };

    const generateExport = () => {
        if (selectedTasks.length === 0) return '';

        switch (selectedFormat) {
            case 'markdown':
                return `# Tasks from ${projectName}\n\n${selectedTasks.map(task => `- [ ] ${task}`).join('\n')}`;
            
            case 'csv':
                return `"Task","Project","Status"\n${selectedTasks.map(task => {
                    const taskInfo = allTasks.find(t => t.task === task);
                    return `"${task}","${projectName}","${taskInfo?.type || 'Todo'}"`;
                }).join('\n')}`;
            
            case 'json':
                return JSON.stringify({
                    project: projectName,
                    tasks: selectedTasks.map(task => {
                        const taskInfo = allTasks.find(t => t.task === task);
                        return {
                            title: task,
                            status: taskInfo?.type || 'Todo',
                            priority: 'medium'
                        };
                    })
                }, null, 2);
            
            case 'todoist':
                return selectedTasks.map(task => `${task} @${projectName.replace(/\s/g, '_')}`).join('\n');
            
            default:
                return '';
        }
    };

    const handleCopyToClipboard = () => {
        const exportText = generateExport();
        navigator.clipboard.writeText(exportText);
        alert('Tasks copied to clipboard!');
    };

    const handleDownload = () => {
        const exportText = generateExport();
        const extensions = {
            markdown: 'md',
            csv: 'csv',
            json: 'json',
            todoist: 'txt'
        };
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s/g, '_')}_tasks.${extensions[selectedFormat]}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Export Tasks</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <Icon name="x" className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Format Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Export Format</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { value: 'markdown', label: 'Markdown', icon: '📝' },
                                { value: 'csv', label: 'CSV', icon: '📊' },
                                { value: 'json', label: 'JSON', icon: '{ }' },
                                { value: 'todoist', label: 'Todoist', icon: '✓' }
                            ].map(format => (
                                <button
                                    key={format.value}
                                    onClick={() => setSelectedFormat(format.value as any)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        selectedFormat === format.value
                                            ? 'border-indigo-500 bg-indigo-900/30 text-white'
                                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{format.icon}</div>
                                    <div className="text-sm font-medium">{format.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task Selection */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-300">
                                Select Tasks ({selectedTasks.length} of {allTasks.length})
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto bg-slate-900 rounded-lg p-3 border border-slate-700">
                            {allTasks.map((item, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-start gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTasks.includes(item.task)}
                                        onChange={() => toggleTask(item.task)}
                                        className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-300">{item.task}</p>
                                        <span className="text-xs text-slate-500">{item.type}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {selectedTasks.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Preview</label>
                            <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto border border-slate-700">
                                {generateExport()}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={selectedTasks.length === 0}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Icon name="link" className="w-4 h-4" />
                        Copy to Clipboard
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={selectedTasks.length === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Icon name="download" className="w-4 h-4" />
                        Download File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskExportModal;
