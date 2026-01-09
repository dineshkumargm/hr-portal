import React from 'react';

interface Insight {
    id: string;
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: string;
    color: string;
}

interface TalentPick {
    id: string;
    name: string;
    role: string;
    matchingScore: number;
    avatar: string;
    skills: string[];
}

const INSIGHTS: Insight[] = [
    { id: '1', title: 'AI Engineering Demand', value: '+42%', change: 'Since last month', isPositive: true, icon: 'trending_up', color: 'text-blue-600 bg-blue-50' },
    { id: '2', title: 'Avg. React Salary', value: '$165k', change: 'Market average', isPositive: true, icon: 'payments', color: 'text-emerald-600 bg-emerald-50' },
    { id: '3', title: 'Remote Job Postings', value: '15.4k', change: 'Global active', isPositive: true, icon: 'distance', color: 'text-purple-600 bg-purple-50' },
];

const TALENT_PICKS: TalentPick[] = [
    { id: 't1', name: 'Alex Rivera', role: 'Senior AI Researcher', matchingScore: 98, avatar: 'https://i.pravatar.cc/150?u=alex', skills: ['PyTorch', 'NLP', 'Computer Vision'] },
    { id: 't2', name: 'Sarah Chen', role: 'Staff Frontend Engineer', matchingScore: 95, avatar: 'https://i.pravatar.cc/150?u=sarah', skills: ['React', 'TypeScript', 'System Design'] },
    { id: 't3', name: 'James Wilson', role: 'DevOps Architect', matchingScore: 92, avatar: 'https://i.pravatar.cc/150?u=james', skills: ['Kubernetes', 'AWS', 'Terraform'] },
];

const NEWS = [
    { id: 'n1', title: 'The Future of AI in Recruitment', source: 'RecruitTech Daily', time: '2h ago', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80' },
    { id: 'n2', title: 'Why Soft Skills are the New Hard Skills', source: 'Hiring Weekly', time: '5h ago', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
];

const Discover: React.FC = () => {
    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto py-4">
            {/* Header Section */}
            <div className="flex items-center gap-4 px-2">
                <div className="size-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                    <span className="material-symbols-outlined text-[28px]">explore</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-main leading-tight">Discover Hub</h1>
                    <p className="text-sm text-text-tertiary">Market insights and AI-curated talent opportunities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Market Insights Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {INSIGHTS.map(insight => (
                            <div key={insight.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-md transition-all group">
                                <div className={`size-10 ${insight.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <span className="material-symbols-outlined">{insight.icon}</span>
                                </div>
                                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">{insight.title}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-2xl font-bold text-text-main leading-none">{insight.value}</h3>
                                    <span className={`text-[10px] font-bold mb-0.5 ${insight.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {insight.isPositive ? '↑' : '↓'} {insight.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Talent Recommendations */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
                                AI Talent Spotlight
                            </h2>
                            <button className="text-sm font-bold text-primary hover:underline">View All</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {TALENT_PICKS.map(pick => (
                                <div key={pick.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-xl hover:border-primary/20 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                            <img src={pick.avatar} alt={pick.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main">{pick.name}</h4>
                                            <p className="text-xs text-text-secondary font-medium">{pick.role}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {pick.skills.slice(0, 2).map(skill => (
                                                    <span key={skill} className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-full uppercase">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="size-10 rounded-full border-2 border-emerald-100 flex items-center justify-center relative">
                                            <span className="text-xs font-bold text-emerald-600">{pick.matchingScore}%</span>
                                            <svg className="absolute inset-0 size-full -rotate-90">
                                                <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-emerald-50 text-[40px]" />
                                                <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" strokeDasharray="113" strokeDashoffset={113 - (113 * pick.matchingScore) / 100} className="text-emerald-500" />
                                            </svg>
                                        </div>
                                        <button className="text-[10px] font-bold text-primary bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">Invite</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column: News & Resources */}
                <div className="space-y-8">
                    {/* News Feed */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">newspaper</span>
                                Market News
                            </h3>
                            <span className="size-2 bg-orange-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {NEWS.map(item => (
                                <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-all cursor-pointer group">
                                    <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-2xl mb-4 group-hover:scale-[1.02] transition-transform" />
                                    <h4 className="text-sm font-bold text-text-main leading-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary font-bold">
                                        <span>{item.source}</span>
                                        <span className="size-1 bg-gray-300 rounded-full"></span>
                                        <span>{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 text-xs font-bold text-text-secondary hover:text-primary hover:bg-gray-50 transition-all uppercase tracking-widest">
                            Read more news
                        </button>
                    </div>

                    {/* Resources */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -rotate-45 translate-x-12 -translate-y-12 rounded-3xl"></div>
                        <span className="material-symbols-outlined text-[40px] mb-6 opacity-80 group-hover:scale-110 transition-transform block">menu_book</span>
                        <h3 className="text-xl font-bold mb-2">Resource Center</h3>
                        <p className="text-sm text-blue-100 mb-6 font-medium leading-relaxed">Download our latest 2026 Hiring Guide and salary benchmarks report.</p>
                        <button className="w-full py-3 bg-white text-primary rounded-xl text-sm font-bold shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            Explorer Library
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discover;
