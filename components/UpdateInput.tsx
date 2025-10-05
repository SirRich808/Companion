
import React, { useState, useRef, FormEvent, useMemo } from 'react';
import Icon from './icons';
import { StructuredState } from '../types';

interface UpdateInputProps {
    onUpdate: (text: string) => void;
    isLoading: boolean;
    currentState?: StructuredState | null;
}

const UpdateInput: React.FC<UpdateInputProps> = ({ onUpdate, isLoading, currentState }) => {
    const [text, setText] = useState('');
    const [showNudges, setShowNudges] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);

    // Generate contextual nudge prompts based on current state
    const nudgePrompts = useMemo(() => {
        const prompts: string[] = [];
        
        if (!currentState) {
            return [
                "What progress did you make today?",
                "What's blocking you right now?",
                "What are you planning to work on next?"
            ];
        }

        if (currentState.blockers && currentState.blockers.length > 0) {
            prompts.push(`How can we resolve: ${currentState.blockers[0]}?`);
            prompts.push("Did you make progress on unblocking anything?");
        }

        if (currentState.nextActions && currentState.nextActions.length > 0) {
            prompts.push(`Did you start working on: ${currentState.nextActions[0]}?`);
            prompts.push("Which next action should be prioritized?");
        }

        if (currentState.inProgress && currentState.inProgress.length > 0) {
            prompts.push(`Any updates on: ${currentState.inProgress[0]}?`);
        }

        if (currentState.clarifyingQuestion) {
            prompts.push(currentState.clarifyingQuestion);
        }

        if (prompts.length === 0) {
            prompts.push("What's your latest progress?");
            prompts.push("Any new ideas or decisions?");
            prompts.push("What are you focusing on today?");
        }

        return prompts;
    }, [currentState]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading) {
            onUpdate(text);
            setText('');
            setShowNudges(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleNudgeClick = (prompt: string) => {
        setText(prompt);
        setShowNudges(false);
        textareaRef.current?.focus();
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = text;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? ' ' : '') + transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            setText(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
            
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sticky bottom-0 border-t border-slate-700">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="relative flex-grow">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onInput={handleInput}
                        onFocus={() => text === '' && setShowNudges(true)}
                        onBlur={() => setTimeout(() => setShowNudges(false), 200)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="What's on your mind? Capture your progress, thoughts, and blockers..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-48 transition-all duration-200 ease-in-out"
                        rows={1}
                        disabled={isLoading}
                    />
                    {showNudges && text === '' && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl z-10">
                            <p className="text-xs text-slate-400 mb-2 font-semibold">💡 Suggested prompts:</p>
                            <div className="space-y-1">
                                {nudgePrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleNudgeClick(prompt)}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                        <button 
                            type="button" 
                            onClick={toggleVoiceInput}
                            disabled={isLoading}
                            title={isRecording ? "Stop recording" : "Start voice input"}
                            className={`p-2 rounded-full transition-all ${
                                isRecording 
                                    ? 'bg-red-600 text-white animate-pulse hover:bg-red-700' 
                                    : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Icon name="mic" className="w-6 h-6" />
                        </button>
                        <button type="submit" disabled={isLoading || !text.trim()} className={`p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 ${text.trim() && !isLoading ? 'scale-105 shadow-md shadow-indigo-500/50' : ''}`}>
                            {isLoading ? <Icon name="loader" className="w-6 h-6" /> : <Icon name="send" className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UpdateInput;
