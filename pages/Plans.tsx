import React, { useState } from 'react';

interface Plan {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
}

const PLANS: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 0,
        priceYearly: 0,
        description: 'For solo recruiters starting their AI journey.',
        features: [
            '10 AI Resume Scores / month',
            'Basic JD Extraction',
            'Community Access',
            'Standard Support'
        ],
        buttonText: 'Current Plan'
    },
    {
        id: 'professional',
        name: 'Professional',
        priceMonthly: 79,
        priceYearly: 59,
        description: 'Advanced AI tools for growing talent teams.',
        features: [
            'Unlimited AI Resume Scores',
            'Pro JD Extraction (PDF+DOCX)',
            'Priority AI Talent Spotlight',
            'Custom Plugin Access',
            '24/7 Priority Support'
        ],
        isPopular: true,
        buttonText: 'Upgrade to Pro'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        priceMonthly: 199,
        priceYearly: 159,
        description: 'Global scale intelligence for large organizations.',
        features: [
            'Everything in Professional',
            'Custom AI Training (Your JDs)',
            'API Access & SDKs',
            'Dedicated Account Manager',
            'SSO & Advanced Security'
        ],
        buttonText: 'Talk to Sales'
    }
];

const COMPARISON_FEATURES = [
    { name: 'AI Resume Scoring', starter: '10/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'JD Extractions', starter: 'Standard', pro: 'Advanced', enterprise: 'Custom Models' },
    { name: 'Plugin Marketplace', starter: 'Limited', pro: 'Full Access', enterprise: 'Full Access' },
    { name: 'Talent Spotlight', starter: 'Basic', pro: 'Priority', enterprise: 'Real-time' },
    { name: 'Team Seats', starter: '1 User', pro: 'Up to 10', enterprise: 'Unlimited' },
    { name: 'Support', starter: 'Email', pro: '24/7 Priority', enterprise: 'Dedicated Manager' },
];

const Plans: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="flex flex-col gap-12 max-w-[1200px] mx-auto py-8">
            {/* Header Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-black text-text-main tracking-tight sm:text-5xl">
                    Select the Perfect <span className="text-primary italic">Intelligence</span> Plan
                </h1>
                <p className="text-text-tertiary font-medium">
                    Scale your recruitment process with AI-driven insights. Choose a plan that fits your team's size and performance goals.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl border border-blue-50 shadow-sm backdrop-blur-sm">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-text-tertiary hover:bg-white'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-text-tertiary hover:bg-white'}`}
                    >
                        Yearly
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-[2.5rem] p-8 border-2 transition-all hover:scale-[1.02] flex flex-col ${plan.isPopular ? 'border-primary shadow-2xl shadow-blue-500/10' : 'border-gray-50 shadow-soft'}`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-text-main mb-2">{plan.name}</h3>
                            <p className="text-sm text-text-tertiary font-medium">{plan.description}</p>
                        </div>

                        <div className="mb-10 flex items-baseline gap-1">
                            <span className="text-4xl font-black text-text-main tracking-tight">
                                ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                            </span>
                            <span className="text-text-tertiary font-bold">/mo</span>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="size-5 rounded-full bg-blue-50 flex items-center justify-center text-primary mt-0.5">
                                        <span className="material-symbols-outlined text-[14px] filled">check</span>
                                    </div>
                                    <span className="text-sm text-text-secondary font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.id === 'starter'
                                ? 'bg-gray-50 text-text-tertiary cursor-default'
                                : 'bg-primary text-white hover:bg-primary-hover shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>

            {/* Feature Table Section */}
            <div className="mt-12 px-4 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Full Feature Matrix</h2>
                    <p className="text-text-tertiary font-bold text-xs uppercase tracking-widest mt-1">Deep Comparison</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-blue-50 shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-10 py-6 text-[11px] font-black text-text-tertiary uppercase tracking-widest bg-gray-50/30">Feature</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-text-tertiary uppercase tracking-widest bg-gray-50/30">Starter</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-primary uppercase tracking-widest bg-blue-50/30">Professional</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-text-tertiary uppercase tracking-widest bg-gray-50/30">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {COMPARISON_FEATURES.map((feat, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-10 py-5 text-sm font-bold text-text-main">{feat.name}</td>
                                        <td className="px-10 py-5 text-sm text-text-tertiary font-medium">{feat.starter}</td>
                                        <td className="px-10 py-5 text-sm text-primary font-bold">{feat.pro}</td>
                                        <td className="px-10 py-5 text-sm text-text-main font-bold">{feat.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="mt-8 bg-gradient-to-br from-primary to-blue-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/30 mx-4">
                <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 size-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                <h3 className="text-3xl font-black mb-4 relative">Need a custom solution?</h3>
                <p className="text-blue-100 font-medium max-w-xl mx-auto mb-10 relative">
                    Join over 500+ global enterprises using RecruitAI Custom Models to streamline their complex hiring pipelines.
                </p>
                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all relative">
                    Contact Enterprise Sales
                </button>
            </div>
        </div>
    );
};

export default Plans;
