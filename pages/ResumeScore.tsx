
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../services/db';
import { Job, Candidate } from '../types';

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: string;
    status: 'READY' | 'READING' | 'PARSING' | 'COMPLETED' | 'ERROR';
    progress: number;
    result?: any;
}

const ResumeScore: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [manualJd, setManualJd] = useState<string>('');
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtractingJd, setIsExtractingJd] = useState(false);
    const [isEditingJd, setIsEditingJd] = useState(false);



    useEffect(() => {
        const fetchJobs = async () => {
            const data = await db.jobs.find();
            setJobs(data);
        };
        fetchJobs();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles: UploadFile[] = selectedFiles.map((f: File) => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            status: 'READY',
            progress: 0
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtractingJd(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(file);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: file.type,
                                    data: base64Data
                                }
                            },
                            {
                                text: "Extract the full Job Description. Format it strictly as follows:\n1. Use '## ' for main headers (Responsibilities, Requirements, Preferred Qualifications).\n2. Use bullet points '- ' for lists.\n3. Return only the structured text with no extra commentary."
                            }

                        ]
                    }
                ]
            });

            if (response.text) {
                setManualJd(response.text);
                setIsEditingJd(false);
            }
        } catch (error) {

            console.error("JD Extraction failed:", error);
            alert("Failed to extract JD from PDF. Please try pasting it manually.");
        } finally {
            setIsExtractingJd(false);
        }
    };


    const startAnalysis = async () => {
        const contextJd = manualJd || jobs.find(j => j.id === selectedJobId)?.title || '';
        if (!contextJd || files.length === 0) return;

        setIsAnalyzing(true);

        // 1. Save Job Description if Manual
        let activeJobId = selectedJobId;
        if (!activeJobId && manualJd) {
            try {
                // Heuristic title from first line or default
                const title = manualJd.split('\n')[0].substring(0, 50) || 'New Position';
                const newJob = await db.jobs.insertOne({
                    id: `j-${Date.now()}`,
                    title: title,
                    department: 'General',
                    location: 'Remote',
                    type: 'Full-time',
                    status: 'Active',
                    description: manualJd,
                    skills: [],
                    applicantsCount: 0,
                    matchesCount: 0,
                    createdAt: new Date().toISOString()
                } as any);
                activeJobId = newJob.id;
            } catch (e) {
                console.error("Failed to save job", e);
            }
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        for (let i = 0; i < files.length; i++) {
            const currentFile = files[i];
            if (currentFile.status === 'COMPLETED') continue;

            setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'READING', progress: 10 } : f));

            try {
                let base64Data = "";
                try {
                    base64Data = await fileToBase64(currentFile.file);
                } catch (e) {
                    console.warn("File reading failed", e);
                }

                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'PARSING', progress: 30 } : f));

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Act as a Technical Recruiter. Analyze the resume "${currentFile.name}" against this Job Description:
          
          JD: ${contextJd}

          Return JSON with: candidateName, currentRole, matchScore (0-100), analysis (1 sentence summary).`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                candidateName: { type: Type.STRING },
                                currentRole: { type: Type.STRING },
                                matchScore: { type: Type.NUMBER },
                                analysis: { type: Type.STRING }
                            }
                        }
                    }
                });

                const data = JSON.parse(response.text || '{}');

                const newCandidate: Candidate = {
                    id: `c-${Date.now()}-${i}`,
                    name: data.candidateName || currentFile.name.split('.')[0],
                    role: data.currentRole || 'Applicant',
                    company: 'Analyzed Profile',
                    location: 'Remote',
                    appliedDate: new Date().toLocaleDateString(),
                    status: 'New',
                    matchScore: data.matchScore || 0,
                    associatedJdId: activeJobId || 'manual',
                    analysis: data.analysis,
                    resumeBase64: base64Data,
                    resumeMimeType: currentFile.file.type
                };

                await db.candidates.insertOne(newCandidate);

                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'COMPLETED', progress: 100, result: data } : f));
            } catch (err) {
                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'ERROR', progress: 0 } : f));
            }
        }

        setIsAnalyzing(false);
    };

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto py-4">
            {/* Page Title Header */}
            <div className="flex items-center gap-4 px-2">
                <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">psychology</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-main leading-tight">Resume Scorer</h1>
                    <p className="text-sm text-text-tertiary">AI-powered content matching for talent acquisition</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Card: Job Description */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                            <span className="material-symbols-outlined text-[20px]">description</span>
                            <span className="text-sm">Job Description</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {manualJd && (
                                <button
                                    onClick={() => setIsEditingJd(!isEditingJd)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-text-secondary hover:bg-gray-100 rounded-lg transition-all border border-gray-100"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {isEditingJd ? 'visibility' : 'edit'}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        {isEditingJd ? 'Preview' : 'Edit'}
                                    </span>
                                </button>
                            )}
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg cursor-pointer transition-all border border-blue-100 group">
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleJdFileUpload} />
                                {isExtractingJd ? (
                                    <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                )}
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                    {isExtractingJd ? 'Extracting...' : 'Upload JD PDF'}
                                </span>
                            </label>
                        </div>

                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[500px] flex flex-col relative group overflow-hidden">
                        {isEditingJd || !manualJd ? (
                            <textarea
                                value={manualJd}
                                onChange={(e) => setManualJd(e.target.value)}
                                placeholder="Enter or paste Job Description details here..."
                                className="w-full h-full resize-none border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 placeholder-text-tertiary leading-relaxed p-2"
                                autoFocus={isEditingJd}
                            />
                        ) : (
                            <div className="w-full h-full overflow-y-auto no-scrollbar space-y-6 pt-2 px-2 pb-20">
                                {manualJd.split('##').map((section, idx) => {
                                    if (!section.trim()) return null;
                                    const lines = section.trim().split('\n');
                                    const title = lines[0].trim();
                                    const content = lines.slice(1).join('\n').trim();

                                    return (
                                        <div key={idx} className="space-y-3">
                                            {idx > 0 && title && (
                                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-blue-50 pb-2 flex items-center gap-2">
                                                    <span className="size-1.5 bg-primary rounded-full"></span>
                                                    {title}
                                                </h3>
                                            )}
                                            <div className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line space-y-2">
                                                {idx === 0 ? section.trim() : content.split('\n').map((line, lIdx) => (
                                                    <div key={lIdx} className="flex items-start gap-2">
                                                        {line.trim().startsWith('-') ? (
                                                            <>
                                                                <span className="size-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                                                                <span>{line.trim().substring(1).trim()}</span>
                                                            </>
                                                        ) : (
                                                            <span>{line}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!manualJd && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12 text-center">
                                <div className="size-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                    <span className="material-symbols-outlined">edit_note</span>
                                </div>
                                <p className="text-sm text-gray-400 font-medium italic">Paste JD to start matching</p>
                            </div>
                        )}
                        {manualJd && !isEditingJd && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6 pointer-events-none">
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-2 opacity-80 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[14px] filled">verified</span>
                                    AI Structured & Ready
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Card: Upload Resumes */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-500 font-bold px-2">
                        <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                        <span className="text-sm">Upload Resumes</span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
                        <label className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 transition-all group p-8 mb-6 bg-gray-50/30">
                            <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                            <div className="size-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                <span className="material-symbols-outlined text-2xl">upload</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-700 mb-1">Click to upload or drag and drop</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">PDF, DOCX (Max 10MB)</p>
                        </label>

                        {/* Selected Files Section */}
                        <div className="flex-1 overflow-y-auto no-scrollbar mb-6 min-h-[200px]">
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Selected Files ({files.length})</p>
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-700 truncate">{file.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{file.size}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Score Action Button */}
                        <button
                            onClick={startAnalysis}
                            disabled={isAnalyzing || files.length === 0 || !manualJd}
                            className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-400 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:shadow-none"
                        >
                            {isAnalyzing ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-symbols-outlined filled">auto_awesome</span>
                            )}
                            {isAnalyzing ? 'Scoring Pipeline...' : 'Score Resumes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-2 text-primary font-bold px-2">
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                    <span className="text-sm">Scoring Results</span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                    {files.length === 0 || files.every(f => f.status === 'READY') ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <div className="size-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200 mb-6">
                                <span className="material-symbols-outlined text-[40px]">grid_view</span>
                            </div>
                            <p className="text-gray-400 font-medium max-w-sm">
                                Upload resumes and click 'Score Resumes' to see analysis here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Candidate</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Match Score</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Summary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {files.filter(f => f.status !== 'READY').map((file, idx) => (
                                        <tr key={file.id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="px-8 py-5 text-sm font-bold text-gray-400">#{idx + 1}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary font-bold text-xs">
                                                        {file.result?.candidateName?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-text-main">{file.result?.candidateName || file.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${file.status === 'COMPLETED' ? 'bg-primary' : 'bg-blue-200'}`}
                                                            style={{ width: `${file.result?.matchScore || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">{file.result?.matchScore || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm text-gray-500 font-medium truncate max-w-lg">{file.result?.analysis || 'Processing...'}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeScore;
