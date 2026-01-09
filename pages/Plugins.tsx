import React, { useState } from 'react';

interface Plugin {
    id: string;
    name: string;
    description: string;
    developer: string;
    category: string;
    icon: string;
    rating: number;
    status: 'READY' | 'INSTALLING' | 'INSTALLED';
    color: string;
}

const CATEGORIES = ["All", "AI Tools", "Communication", "Analytics", "Job Boards"];

const PLUGINS: Plugin[] = [
    {
        id: 'p1',
        name: 'LinkedIn Scout',
        description: 'Auto-import candidates from LinkedIn with one click.',
        developer: 'RecruitAI Core',
        category: 'Job Boards',
        icon: 'share',
        rating: 4.8,
        status: 'READY',
        color: 'bg-blue-600'
    },
    {
        id: 'p2',
        name: 'Slack AI Bot',
        description: 'Get real-time hiring alerts and chat with candidates in Slack.',
        developer: 'Communication Hub',
        category: 'Communication',
        icon: 'chat_bubble',
        rating: 4.5,
        status: 'INSTALLED',
        color: 'bg-purple-600'
    },
    {
        id: 'p3',
        name: 'Resume Parser Pro',
        description: 'Extract skills and experience from 50+ resume formats.',
        developer: 'AI Intelligence',
        category: 'AI Tools',
        icon: 'description',
        rating: 4.9,
        status: 'READY',
        color: 'bg-emerald-600'
    },
    {
        id: 'p4',
        name: 'Predictive Hired',
        description: 'AI model that predicts candidate retention and success.',
        developer: 'Data Science Lab',
        category: 'Analytics',
        icon: 'query_stats',
        rating: 4.7,
        status: 'READY',
        color: 'bg-amber-600'
    },
    {
        id: 'p5',
        name: 'Gmail Sync',
        description: 'Sync email threads and schedule interviews directly.',
        developer: 'Productivity Suite',
        category: 'Communication',
        icon: 'mail',
        rating: 4.6,
        status: 'READY',
        color: 'bg-red-500'
    },
    {
        id: 'p6',
        name: 'GitHub Talent scout',
        description: 'Analyze developer portfolios and contributions automatically.',
        developer: 'RecruitAI Labs',
        category: 'Job Boards',
        icon: 'code',
        rating: 4.4,
        status: 'READY',
        color: 'bg-slate-900'
    }
];

const Plugins: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS);

    const filteredPlugins = plugins.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleInstall = (id: string) => {
        setPlugins(prev => prev.map(p =>
            p.id === id ? { ...p, status: 'INSTALLING' } : p
        ));

        setTimeout(() => {
            setPlugins(prev => prev.map(p =>
                p.id === id ? { ...p, status: 'INSTALLED' } : p
            ));
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto py-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">apps</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main leading-tight">Plugins Marketplace</h1>
                        <p className="text-sm text-text-tertiary">Extend your workflow with powerful integrations</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search plugins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-6 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64 shadow-soft transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-primary-hover active:scale-95 transition-all shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Submit Plugin
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap border-2 ${activeCategory === cat
                                ? 'bg-primary border-primary text-white shadow-md shadow-blue-500/10'
                                : 'bg-white border-transparent text-text-secondary hover:border-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Plugins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                {filteredPlugins.map(plugin => (
                    <div key={plugin.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-soft hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col">
                        {/* Glossy Overlay effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent -rotate-45 translate-x-12 -translate-y-12"></div>

                        <div className="flex items-start justify-between mb-6">
                            <div className={`size-14 rounded-2xl ${plugin.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-[28px]">{plugin.icon}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-500 mb-1">
                                    <span className="material-symbols-outlined text-[16px] filled">star</span>
                                    <span className="text-xs font-bold">{plugin.rating}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{plugin.category}</span>
                            </div>
                        </div>

                        <div className="mb-6 flex-1">
                            <h3 className="text-lg font-bold text-text-main mb-2 tracking-tight group-hover:text-primary transition-colors">{plugin.name}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed font-medium line-clamp-2">{plugin.description}</p>
                            <p className="text-[11px] text-text-tertiary mt-4 font-bold uppercase tracking-wider">By {plugin.developer}</p>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            {plugin.status === 'INSTALLED' ? (
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <span className="material-symbols-outlined text-[20px] filled">check_circle</span>
                                    <span className="text-sm font-bold">Installed</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleInstall(plugin.id)}
                                    disabled={plugin.status === 'INSTALLING'}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-text-main rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {plugin.status === 'INSTALLING' ? (
                                        <>
                                            <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            Installing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                            Install
                                        </>
                                    )}
                                </button>
                            )}

                            <button className="p-2.5 rounded-xl text-gray-300 hover:text-primary hover:bg-blue-50 transition-all" title="Plugin Settings">
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                            </button>
                        </div>
                    </div>
                ))}

                {filteredPlugins.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-200">
                            <span className="material-symbols-outlined text-[48px]">search_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">No plugins found</h3>
                        <p className="text-text-tertiary text-sm max-w-xs">We couldn't find any plugins matching "{searchQuery}" in this category.</p>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="mt-12 px-6 py-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-[2.5rem] border border-blue-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="size-12 rounded-full bg-white shadow-soft flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">terminal</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main">Build your own plugin</h4>
                        <p className="text-sm text-text-secondary">Access our API documentation and SDK to extend RecruitAI.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-white border border-blue-100 text-primary rounded-xl text-sm font-bold shadow-soft hover:shadow-md transition-all active:scale-95">
                    View Documentation
                </button>
            </div>
        </div>
    );
};

export default Plugins;
