"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
    authenticated: boolean;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export default function AdminWorkspaces() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/auth/user', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data);

                    if (data.user?.role !== 'admin') {
                        alert('Access denied. Admin privileges required.');
                        router.push('/');
                        return;
                    }
                } else {
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/login');
                return;
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                alert('Workspace created successfully!');
                setFormData({ name: '', location: '', capacity: '' });
                router.push('/');
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            alert('Error creating workspace');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="font-sans min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!userData?.authenticated || userData.user?.role !== 'admin') {
        return (
            <div className="font-sans min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-600">Access denied. Admin privileges required.</div>
                    <a href="/" className="text-blue-500 hover:underline">
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Workspace</h1>
                    <p className="text-gray-600">
                        Welcome, {userData.user?.email} (Admin)
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Workspace Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Conference Room A"
                            />
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                required
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Floor 3, Building A"
                            />
                        </div>

                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity (Number of People) *
                            </label>
                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                required
                                min="1"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 10"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Workspace'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
