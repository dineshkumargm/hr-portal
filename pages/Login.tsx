
import React, { useState } from 'react';
import { db } from '../services/db';

interface LoginProps {
    onSuccess: () => void;
    onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onRegisterClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await db.login({ email, password });
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#0d0f1c] dark:text-white font-display">
            <header className="sticky top-0 z-50 w-full border-b border-[#e6e9f4] dark:border-gray-800 bg-surface-light/90 dark:bg-background-dark/90 backdrop-blur-md transition-colors">
                <div className="flex justify-center">
                    <div className="flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-10">
                        <div className="flex items-center gap-4 text-primary dark:text-white cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="size-8 text-primary">
                                <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                                    <path clip-rule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.901L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fill-rule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#0d0f1c] dark:text-white">ResumeAI</h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onRegisterClick}
                                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-[#e6e9f4] dark:border-gray-700 hover:bg-[#e6e9f4] dark:hover:bg-gray-800 text-[#0d0f1c] dark:text-white text-sm font-bold transition-colors"
                            >
                                <span className="truncate">Sign Up</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tight text-[#0d0f1c] dark:text-white sm:text-4xl">
                            Welcome Back
                        </h1>
                        <p className="mt-4 text-base text-[#47569e] dark:text-gray-400">
                            Sign in to manage your hiring pipeline.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-surface-dark py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-xl border border-[#e6e9f4] dark:border-gray-800 sm:px-10">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#0d0f1c] dark:text-gray-200" htmlFor="email">
                                    Work Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-background-dark text-gray-900 dark:text-white transition-colors"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0d0f1c] dark:text-gray-200" htmlFor="password">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-background-dark text-gray-900 dark:text-white transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-background-dark dark:border-gray-600"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-surface-dark text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-background-dark text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                                    </svg>
                                </button>
                                <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-background-dark text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 21 21">
                                        <path d="M1 1h9v9H1z" fill="#f25022"></path>
                                        <path d="M1 11h9v9H1z" fill="#00a4ef"></path>
                                        <path d="M11 1h9v9H11z" fill="#7fba00"></path>
                                        <path d="M11 11h9v9H11z" fill="#ffb900"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#e6e9f4] dark:border-gray-800 bg-white dark:bg-surface-dark py-8">
                <div className="flex justify-center">
                    <div className="w-full max-w-[1280px] px-4 md:px-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-400">
                                © 2023 ResumeAI Inc. All rights reserved.
                            </div>
                            <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                                <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                                <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
