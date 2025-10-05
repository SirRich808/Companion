
import React, { useState, useRef } from 'react';
import Icon from './icons';
import { ProjectCreationInput } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: ProjectCreationInput) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onAddProject }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setFileContent(event.target.result);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file");
        removeFile();
      }
      reader.readAsText(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileContent('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const resetState = () => {
    setName('');
    setGoal('');
    removeFile();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && goal.trim()) {
      onAddProject({ name, goal, documentContent: fileContent });
      resetState();
      onClose();
    }
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Start a New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-slate-300 text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Launch My Newsletter"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="projectGoal" className="block text-slate-300 text-sm font-medium mb-2">What is the primary goal?</label>
            <textarea
              id="projectGoal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., To build an audience of 1,000 subscribers in 6 months."
              rows={3}
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Attach Documentation (Optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md,.text"
            />
            {!file ? (
                <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 hover:border-slate-500 transition-colors"
                >
                <Icon name="upload" className="w-5 h-5" />
                Select a file
                </button>
            ) : (
                <div className="w-full flex items-center justify-between p-2 bg-slate-900 border border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-300 truncate pl-2">{file.name}</p>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
                        aria-label="Remove file"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Icon name="rocket" className="w-5 h-5" />
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
