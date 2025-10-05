import React, { useState } from 'react';
import { Project } from '../types';
import Icon from './icons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    onToggleSharing: (enabled: boolean) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, project, onToggleSharing }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isOpen) return null;

    const shareUrl = project.shareId 
        ? `${window.location.origin}/shared/${project.shareId}`
        : '';

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleToggleSharing = () => {
        onToggleSharing(!project.isShared);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full border border-slate-700">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Share Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <Icon name="x" className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Share Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Enable Public Sharing</h3>
                            <p className="text-sm text-slate-400">
                                Anyone with the link can view this project (read-only)
                            </p>
                        </div>
                        <button
                            onClick={handleToggleSharing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                project.isShared ? 'bg-indigo-600' : 'bg-slate-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    project.isShared ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {project.isShared && shareUrl && (
                        <>
                            {/* Share Link */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Share Link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Icon name={copySuccess ? 'checkCircle' : 'link'} className="w-4 h-4" />
                                        {copySuccess ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {/* Features Info */}
                            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                                <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                    <Icon name="messageSquare" className="w-4 h-4" />
                                    What others can do:
                                </h4>
                                <ul className="space-y-1 text-sm text-blue-200">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> View project status and timeline
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> Leave comments on updates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-red-400">✗</span> Edit or add new updates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-red-400">✗</span> Modify project settings
                                    </li>
                                </ul>
                            </div>

                            {/* Warning */}
                            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
                                <p className="text-sm text-orange-300 flex items-start gap-2">
                                    <Icon name="alertTriangle" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        This link provides read-only access. Anyone with the link can view all project
                                        details, updates, and comments. Turn off sharing to revoke access.
                                    </span>
                                </p>
                            </div>
                        </>
                    )}

                    {!project.isShared && (
                        <div className="text-center py-8">
                            <Icon name="share" className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">
                                Enable sharing to generate a read-only link for this project.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
