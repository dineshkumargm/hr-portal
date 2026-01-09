import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User } from '../types';

const Settings: React.FC = () => {
    const [user, setUser] = useState<User | null>(db.getUser());
    const [saving, setSaving] = useState(false);

    // Form State
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('Technology');
    const [aiRigorous, setAiRigorous] = useState(true);
    const [aiBiasRedaction, setAiBiasRedaction] = useState(false);
    const [emailDigests, setEmailDigests] = useState(true);

    // Load data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                const freshUser = await db.refreshUser(user.id);
                if (freshUser) {
                    setUser(freshUser);
                    // Initialize settings if they exist
                    if (freshUser.settings) {
                        setCompanyName(freshUser.settings.companyName || 'RecruitAI Global');
                        setIndustry(freshUser.settings.industry || 'Technology');
                        setAiRigorous(freshUser.settings.aiRigorous ?? true);
                        setAiBiasRedaction(freshUser.settings.aiBiasRedaction ?? false);
                        setEmailDigests(freshUser.settings.emailDigests ?? true);
                    }
                }
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const updatedSettings = {
                companyName,
                industry,
                aiRigorous,
                aiBiasRedaction,
                emailDigests
            };
            await db.updateUser(user.id, { settings: updatedSettings });
            // Optional: toast notification here
            const btn = document.getElementById('save-btn');
            if (btn) btn.innerText = 'Saved!';
            setTimeout(() => { if (btn) btn.innerText = 'Save System Preferences'; }, 2000);
        } catch (e) {
            console.error("Failed to save settings", e);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-10">
                <div className="size-14 rounded-2xl bg-white shadow-soft flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">settings</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight">System Settings</h1>
                    <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">Configuration & Controls</p>
                </div>
            </div>

            <div className="space-y-8">
                <section className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-blue-50">
                    <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        Company Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1">Organization Name</label>
                            <input
                                className="w-full h-14 bg-background-main border-none rounded-2xl px-5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 transition-all"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="RecruitAI Global"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1">Industry</label>
                            <select
                                className="w-full h-14 bg-background-main border-none rounded-2xl px-5 text-sm font-bold text-text-main focus:ring-2 focus:ring-primary/20 transition-all"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            >
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-blue-50">
                    <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        AI Engine Preferences
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-background-main rounded-2xl transition-all hover:bg-blue-50/50">
                            <div>
                                <p className="font-bold text-text-main">Strict Semantic Matching</p>
                                <p className="text-xs text-text-tertiary">Prioritize exact technical skills over broad industry experience.</p>
                            </div>
                            <button
                                onClick={() => setAiRigorous(!aiRigorous)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${aiRigorous ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 shadow-sm ${aiRigorous ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background-main rounded-2xl transition-all hover:bg-blue-50/50">
                            <div>
                                <p className="font-bold text-text-main">Automated Bias Redaction</p>
                                <p className="text-xs text-text-tertiary">Remove PII during initial AI screening stages.</p>
                            </div>
                            <button
                                onClick={() => setAiBiasRedaction(!aiBiasRedaction)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${aiBiasRedaction ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 shadow-sm ${aiBiasRedaction ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-blue-50">
                    <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        Communication
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-background-main rounded-2xl mb-4 transition-all hover:bg-blue-50/50">
                        <div>
                            <p className="font-bold text-text-main">Email Digests</p>
                            <p className="text-xs text-text-tertiary">Receive daily summaries of top candidate matches.</p>
                        </div>
                        <button
                            onClick={() => setEmailDigests(!emailDigests)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${emailDigests ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 shadow-sm ${emailDigests ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                </section>

                <div className="flex justify-end gap-4">
                    <button className="px-8 py-4 rounded-2xl text-xs font-bold text-text-tertiary uppercase tracking-widest hover:bg-blue-50 transition-all">Discard Changes</button>
                    <button
                        id="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-10 py-4 bg-primary text-white rounded-2xl text-xs font-bold shadow-xl shadow-blue-500/20 hover:bg-primary-hover transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save System Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
