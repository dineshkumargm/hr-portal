import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../services/db';
import { Job, Candidate } from '../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

type ContextType = 'job' | 'resume' | 'candidate' | null;

interface ChatContext {
    type: ContextType;
    jobId?: string;
    candidateId?: string;
    data?: Job | Candidate;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm RecruitAI Agent. I can help you analyze candidates, discuss job descriptions, review resumes, or answer questions about your recruitment pipeline. Select a job, resume, or candidate to get started, or ask me anything!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState<ChatContext>({ type: null });
    const [jobs, setJobs] = useState<Job[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsData, candidatesData] = await Promise.all([
                    db.jobs.find(),
                    db.candidates.find()
                ]);
                setJobs(jobsData);
                setCandidates(candidatesData);
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showContextMenu && !target.closest('.context-menu-container')) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showContextMenu]);

    const loadContextData = async (type: ContextType, id: string) => {
        try {
            if (type === 'job') {
                const job = await db.jobs.findOne({ id });
                if (job) {
                    setContext({ type: 'job', jobId: id, data: job });
                    addSystemMessage(`Now discussing Job: ${job.title} (${job.department})`);
                }
            } else if (type === 'candidate') {
                const candidate = await db.candidates.findOne({ id });
                if (candidate) {
                    setContext({ type: 'candidate', candidateId: id, data: candidate });
                    addSystemMessage(`Now discussing Candidate: ${candidate.name} (${candidate.role})`);
                }
            } else if (type === 'resume') {
                const candidate = await db.candidates.findOne({ id });
                if (candidate) {
                    setContext({ type: 'resume', candidateId: id, data: candidate });
                    addSystemMessage(`Now reviewing Resume: ${candidate.name}'s resume`);
                }
            }
        } catch (err) {
            console.error("Failed to load context:", err);
        }
    };

    const addSystemMessage = (content: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date()
        }]);
    };

    const buildContextPrompt = async (): Promise<string> => {
        let contextPrompt = "You are RecruitAI Agent, an AI recruitment assistant. ";
        
        if (context.type === 'job' && context.data) {
            const job = context.data as Job;
            contextPrompt += `\n\nCURRENT CONTEXT - JOB DESCRIPTION:\n`;
            contextPrompt += `Job ID: ${job.id}\n`;
            contextPrompt += `Title: ${job.title}\n`;
            contextPrompt += `Department: ${job.department}\n`;
            contextPrompt += `Location: ${job.location}\n`;
            contextPrompt += `Type: ${job.type}\n`;
            contextPrompt += `Status: ${job.status}\n`;
            contextPrompt += `Required Skills: ${job.skills?.join(', ') || 'Not specified'}\n`;
            contextPrompt += `Applicants Count: ${job.applicantsCount || 0}\n`;
            contextPrompt += `High Matches Count: ${job.matchesCount || 0}\n`;
            if (job.description) {
                contextPrompt += `Full Description: ${job.description}\n`;
            }
            
            // Include candidates for this job
            const jobCandidates = candidates.filter(c => c.associatedJdId === job.id);
            if (jobCandidates.length > 0) {
                contextPrompt += `\nCandidates for this job (${jobCandidates.length}):\n`;
                jobCandidates.forEach((c, idx) => {
                    contextPrompt += `${idx + 1}. ${c.name} - ${c.role} (${c.matchScore}% match, Status: ${c.status})\n`;
                });
            }
            
            contextPrompt += `\nThe user is asking questions about this job description. Provide detailed, helpful answers using the candidate data above.`;
        } else if (context.type === 'candidate' && context.data) {
            const candidate = context.data as Candidate;
            contextPrompt += `\n\nCURRENT CONTEXT - CANDIDATE PROFILE (Full Data):\n`;
            contextPrompt += `Candidate ID: ${candidate.id}\n`;
            contextPrompt += `Name: ${candidate.name}\n`;
            contextPrompt += `Current Role/Title: ${candidate.role}\n`;
            contextPrompt += `Current Company: ${candidate.company}\n`;
            contextPrompt += `Location: ${candidate.location}\n`;
            contextPrompt += `Application Status: ${candidate.status}\n`;
            contextPrompt += `AI Match Score: ${candidate.matchScore}%\n`;
            contextPrompt += `Applied Date: ${candidate.appliedDate}\n`;
            contextPrompt += `Associated Job ID: ${candidate.associatedJdId || 'Not assigned'}\n`;
            
            if (candidate.analysis) {
                contextPrompt += `\nDetailed AI Analysis:\n${candidate.analysis}\n`;
            }
            
            // Include associated job information if available
            if (candidate.associatedJdId) {
                const associatedJob = jobs.find(j => j.id === candidate.associatedJdId);
                if (associatedJob) {
                    contextPrompt += `\nAssociated Job Position:\n`;
                    contextPrompt += `- Title: ${associatedJob.title}\n`;
                    contextPrompt += `- Department: ${associatedJob.department}\n`;
                    contextPrompt += `- Required Skills: ${associatedJob.skills?.join(', ') || 'Not specified'}\n`;
                    if (associatedJob.description) {
                        contextPrompt += `- Description: ${associatedJob.description.substring(0, 1000)}\n`;
                    }
                }
            }
            
            // Check if resume is available
            if (candidate.resumeBase64) {
                contextPrompt += `\nResume Available: Yes (${candidate.resumeMimeType || 'PDF'})\n`;
                contextPrompt += `Note: The full resume content has been analyzed and the key information is included in the analysis above.\n`;
            } else {
                contextPrompt += `\nResume Available: No\n`;
            }
            
            contextPrompt += `\nThe user is asking questions about this candidate. Use ALL the candidate data provided above to give comprehensive insights, recommendations, and analysis.`;
        } else if (context.type === 'resume' && context.data) {
            const candidate = context.data as Candidate;
            contextPrompt += `\n\nCURRENT CONTEXT - RESUME REVIEW (Full Candidate Data):\n`;
            contextPrompt += `Candidate ID: ${candidate.id}\n`;
            contextPrompt += `Candidate Name: ${candidate.name}\n`;
            contextPrompt += `Current Role: ${candidate.role}\n`;
            contextPrompt += `Current Company: ${candidate.company}\n`;
            contextPrompt += `Location: ${candidate.location}\n`;
            contextPrompt += `Application Status: ${candidate.status}\n`;
            contextPrompt += `AI Match Score: ${candidate.matchScore}%\n`;
            contextPrompt += `Applied Date: ${candidate.appliedDate}\n`;
            
            if (candidate.analysis) {
                contextPrompt += `\nPrevious Resume Analysis:\n${candidate.analysis}\n`;
            }
            
            // Include associated job for context
            if (candidate.associatedJdId) {
                const associatedJob = jobs.find(j => j.id === candidate.associatedJdId);
                if (associatedJob) {
                    contextPrompt += `\nJob Position Applied For:\n`;
                    contextPrompt += `- Title: ${associatedJob.title}\n`;
                    contextPrompt += `- Department: ${associatedJob.department}\n`;
                    contextPrompt += `- Required Skills: ${associatedJob.skills?.join(', ') || 'Not specified'}\n`;
                    if (associatedJob.description) {
                        contextPrompt += `- Description: ${associatedJob.description.substring(0, 1000)}\n`;
                    }
                }
            }
            
            if (candidate.resumeBase64) {
                contextPrompt += `\nResume Status: Available (${candidate.resumeMimeType || 'PDF'})\n`;
                contextPrompt += `Note: The resume has been analyzed and key information extracted. Use the analysis data above.\n`;
            }
            
            contextPrompt += `\nThe user is reviewing this resume. Provide detailed feedback, strengths, weaknesses, recommendations, and suggestions for improvement based on the candidate data above.`;
        } else {
            contextPrompt += `\n\nGENERAL CONTEXT:\n`;
            contextPrompt += `Total Jobs: ${jobs.length}\n`;
            contextPrompt += `Total Candidates: ${candidates.length}\n`;
            
            // Include summary of all candidates
            if (candidates.length > 0) {
                contextPrompt += `\nAll Candidates Summary:\n`;
                candidates.slice(0, 20).forEach((c, idx) => {
                    contextPrompt += `${idx + 1}. ${c.name} - ${c.role} (${c.matchScore}% match, ${c.status})\n`;
                });
                if (candidates.length > 20) {
                    contextPrompt += `... and ${candidates.length - 20} more candidates\n`;
                }
            }
            
            // Include summary of all jobs
            if (jobs.length > 0) {
                contextPrompt += `\nAll Jobs Summary:\n`;
                jobs.forEach((j, idx) => {
                    contextPrompt += `${idx + 1}. ${j.title} - ${j.department} (${j.applicantsCount} applicants, ${j.matchesCount} high matches)\n`;
                });
            }
            
            contextPrompt += `\nThe user can ask general questions about recruitment, or select a specific job, candidate, or resume to discuss. Use the candidate and job data above to provide informed answers.`;
        }

        return contextPrompt;
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const API_KEY = (() => {
                // @ts-ignore
                if (import.meta.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
                // @ts-ignore
                if (import.meta.env?.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
                return undefined;
            })();

            if (!API_KEY) {
                throw new Error("API Key not found");
            }

            const genAIInstance = new GoogleGenerativeAI(API_KEY);
            const model = genAIInstance.getGenerativeModel({ 
                model: 'gemini-flash-latest' 
            });

            const contextPrompt = await buildContextPrompt();
            
            // Build conversation history from previous messages (excluding current user message and initial greeting)
            // Skip first message (initial greeting) and build pairs
            const previousMessages = messages.slice(1); // Skip initial greeting
            const conversationHistory: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> = [];
            
            // Build history pairs, ensuring we start with user message and alternate properly
            for (let i = 0; i < previousMessages.length; i++) {
                const msg = previousMessages[i];
                const role = msg.role === 'user' ? 'user' : 'model';
                
                // Ensure proper alternation: if last added was user, next must be model, and vice versa
                const lastAdded = conversationHistory[conversationHistory.length - 1];
                if (!lastAdded || lastAdded.role !== role) {
                    conversationHistory.push({
                        role: role,
                        parts: [{ text: msg.content }]
                    });
                }
            }
            
            // Ensure history starts with user message (required by Gemini)
            if (conversationHistory.length > 0 && conversationHistory[0].role !== 'user') {
                conversationHistory.shift(); // Remove first message if it's not from user
            }

            // Only use startChat if we have valid history (must start with user)
            let chat;
            if (conversationHistory.length > 0 && conversationHistory[0].role === 'user') {
                chat = model.startChat({
                    history: conversationHistory,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                    }
                });
            } else {
                // No valid history, start fresh chat
                chat = model.startChat({
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                    }
                });
            }
            
            // Prepend context to the user message instead of using systemInstruction
            const messageWithContext = `${contextPrompt}\n\nUser Question: ${currentInput}`;

            // Stream the response for real-time feel
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);

            const result = await chat.sendMessageStream(messageWithContext);
            let fullResponse = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;
                
                // Update the message in real-time
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMsg.id 
                        ? { ...msg, content: fullResponse }
                        : msg
                ));
            }

        } catch (error: any) {
            console.error("Chat Error:", error);
            if (error.name === 'AbortError') {
                return; // Request was cancelled
            }
            
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg.role === 'assistant' && !lastMsg.content) {
                    return prev.slice(0, -1).concat([{
                        ...lastMsg,
                        content: "I encountered an error processing your request. Please try again or check your API configuration."
                    }]);
                }
                return prev.concat([{
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "I encountered an error connecting to my core processing unit. Please try again.",
                    timestamp: new Date()
                }]);
            });
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const clearContext = () => {
        setContext({ type: null });
        addSystemMessage("Context cleared. You can now ask general questions or select a new job, candidate, or resume.");
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg">K</div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main">Chat with Kai</h2>
                        <p className="text-xs text-text-tertiary">Your AI Recruitment Assistant</p>
                    </div>
                </div>
                
                <div className="relative context-menu-container">
                    <button
                        onClick={() => setShowContextMenu(!showContextMenu)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            context.type 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'bg-white border border-blue-100 text-primary hover:bg-blue-50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {context.type === 'job' ? 'business_center' : 
                             context.type === 'candidate' ? 'person' : 
                             context.type === 'resume' ? 'description' : 'add'}
                        </span>
                        {context.type 
                            ? `${context.type === 'job' ? 'Job' : context.type === 'candidate' ? 'Candidate' : 'Resume'} Selected`
                            : 'Select Context'}
                    </button>

                    {showContextMenu && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden context-menu-container">
                            <div className="p-3 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Context</span>
                                    {context.type && (
                                        <button
                                            onClick={clearContext}
                                            className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="p-2">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Jobs</div>
                                    {jobs.length === 0 ? (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center">No jobs available</div>
                                    ) : (
                                        jobs.map(job => (
                                            <button
                                                key={job.id}
                                                onClick={() => {
                                                    loadContextData('job', job.id);
                                                    setShowContextMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-all ${
                                                    context.jobId === job.id
                                                        ? 'bg-blue-50 border-2 border-primary'
                                                        : 'hover:bg-gray-50 border-2 border-transparent'
                                                }`}
                                            >
                                                <div className="font-bold text-sm text-gray-700">{job.title}</div>
                                                <div className="text-xs text-gray-400">{job.department} • {job.location}</div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Candidates</div>
                                    {candidates.length === 0 ? (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center">No candidates available</div>
                                    ) : (
                                        candidates.map(candidate => (
                                            <div key={candidate.id} className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        loadContextData('candidate', candidate.id);
                                                        setShowContextMenu(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                                        context.candidateId === candidate.id && context.type === 'candidate'
                                                            ? 'bg-blue-50 border-2 border-primary'
                                                            : 'hover:bg-gray-50 border-2 border-transparent'
                                                    }`}
                                                >
                                                    <div className="font-bold text-sm text-gray-700">{candidate.name}</div>
                                                    <div className="text-xs text-gray-400">{candidate.role} • {candidate.matchScore}% match</div>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        loadContextData('resume', candidate.id);
                                                        setShowContextMenu(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-xl transition-all text-xs ${
                                                        context.candidateId === candidate.id && context.type === 'resume'
                                                            ? 'bg-purple-50 border-2 border-purple-500'
                                                            : 'hover:bg-gray-50 border-2 border-transparent text-gray-500'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">description</span>
                                                    Review Resume
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {context.type && context.data && (
                <div className="mb-4 px-2">
                    <div className={`p-4 rounded-2xl border-2 ${
                        context.type === 'job' ? 'bg-blue-50 border-blue-200' :
                        context.type === 'candidate' ? 'bg-green-50 border-green-200' :
                        'bg-purple-50 border-purple-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined ${
                                    context.type === 'job' ? 'text-blue-600' :
                                    context.type === 'candidate' ? 'text-green-600' :
                                    'text-purple-600'
                                }`}>
                                    {context.type === 'job' ? 'business_center' : 
                                     context.type === 'candidate' ? 'person' : 'description'}
                                </span>
                                <div>
                                    <div className="font-bold text-sm text-gray-700">
                                        {context.type === 'job' 
                                            ? (context.data as Job).title
                                            : (context.data as Candidate).name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {context.type === 'job' 
                                            ? `${(context.data as Job).department} • ${(context.data as Job).location}`
                                            : `${(context.data as Candidate).role} • ${(context.data as Candidate).matchScore}% match`}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={clearContext}
                                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-[10px] ${
                                    msg.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {msg.role === 'user' ? 'ME' : 'K'}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-none shadow-sm'
                                        : 'bg-gray-50 text-text-main rounded-tl-none border border-gray-100'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] flex gap-3">
                                <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">K</div>
                                <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                context.type === 'job' ? "Ask about this job description..." :
                                context.type === 'candidate' ? "Ask about this candidate..." :
                                context.type === 'resume' ? "Ask about this resume..." :
                                "Ask anything about your pipeline..."
                            }
                            className="w-full h-14 pl-5 pr-24 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowContextMenu(false);
                                }
                            }}
                        />
                        <div className="absolute right-2 top-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowContextMenu(!showContextMenu)}
                                className={`size-10 flex items-center justify-center rounded-xl transition-colors ${
                                    context.type 
                                        ? 'text-primary hover:bg-blue-50' 
                                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                            </button>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="h-10 px-4 bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 flex items-center gap-2"
                            >
                                <span>Send</span>
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
