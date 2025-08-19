"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        window.location.href = '/';
                        return;
                    }
                }
            } catch (error) {
                console.error('res not OK', error);
            } finally {
                setIsCheckingAuth(false);
            }
        })();
    }, [router]);

    async function postEmail(params: { email: string; password: string }) {
        try {
            return await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
                credentials: 'include'
            });
        } catch (err) {
            console.error('Network error:', err);
            throw err;
        }
    }
    async function handleLogin(e?: React.FormEvent) {
        if (e) e.preventDefault();

        try {
            const response = await postEmail({
                email: formData.email,
                password: formData.password,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed');
                return;
            }

            const data = await response.json();
            console.log('Login successful:', data);
            setIsLoggedIn(true);
            window.location.href = '/';
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) setError(null);
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Checking authentication...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            {error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div>{isLoggedIn ? 'Welcome! You are logged in' :
                    <form onSubmit={handleLogin} className="bg-amber-50 p-8 rounded-lg shadow-md w-96 space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-2">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                        >
                            Login
                        </button>
                    </form>
                }</div>
            )}
        </div>
    );
}