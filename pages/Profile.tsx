import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User } from '../types';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(db.getUser());

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                const freshUser = await db.refreshUser(user.id);
                if (freshUser) setUser(freshUser);
            }
        };
        fetchUserData();
    }, []);

    if (!user) return null;

    const stats = [
        { label: 'Hired Candidates', value: user.stats?.hired || '0', icon: 'check_circle', color: 'text-accent' },
        { label: 'Time to Hire', value: user.stats?.timeToHire || '0 Days', icon: 'schedule', color: 'text-primary' },
        { label: 'Efficiency', value: user.stats?.efficiency || '0%', icon: 'trending_up', color: 'text-purple-500' }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white rounded-[3rem] shadow-soft border border-blue-50 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-primary to-blue-400 relative">
                    <div className="absolute -bottom-16 left-10">
                        <div className="size-36 rounded-[2.5rem] border-[6px] border-white bg-cover bg-center shadow-xl" style={{ backgroundImage: `url(${user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0d33f2&color=fff`})` }}></div>
                        <div className="absolute bottom-2 right-2 size-8 bg-accent rounded-full border-4 border-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[16px]">verified</span>
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-12 px-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-text-main tracking-tight">{user.name}</h1>
                            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-1">{user.title || 'Recruiter'}</p>
                        </div>
                        <button className="px-8 py-3 bg-white border border-blue-100 rounded-2xl text-xs font-bold text-text-main hover:bg-blue-50 transition-all shadow-sm uppercase tracking-widest">Edit Profile</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-background-main p-6 rounded-[2rem] border border-blue-50">
                                <div className={`size-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ${stat.color}`}>
                                    <span className="material-symbols-outlined">{stat.icon}</span>
                                </div>
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-text-main mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-10">
                        <section>
                            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person_pin</span>
                                About Me
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                {user.about || 'Passionate about bridging the gap between talent and opportunity. With over 8 years in the technology recruitment space, I specialize in identifying high-impact engineering leads and fostering diverse, inclusive work environments.'}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contact_mail</span>
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-4 bg-background-main rounded-2xl border border-blue-50">
                                    <span className="material-symbols-outlined text-text-tertiary">mail</span>
                                    <span className="text-sm font-bold text-text-main">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-background-main rounded-2xl border border-blue-50">
                                    <span className="material-symbols-outlined text-text-tertiary">location_on</span>
                                    <span className="text-sm font-bold text-text-main">{user.location || 'San Francisco, CA'}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
