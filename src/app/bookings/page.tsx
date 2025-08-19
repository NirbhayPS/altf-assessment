"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
    id: string;
    workspace: {
        name: string;
        location: string;
    };
    date: string;
    time: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;
}

interface UserData {
    authenticated: boolean;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export default function Bookings() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Fetch user data
                const userRes = await fetch('/api/auth/user', { credentials: 'include' });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserData(userData);
                } else {
                    window.location.href = '/login';
                    return;
                }

                // Fetch bookings
                const bookingsRes = await fetch('/api/bookings', { credentials: 'include' });
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData.bookings);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="font-sans min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!userData?.authenticated) {
        return (
            <div className="font-sans min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-600">Not authenticated</div>
                    <a href="/login" className="text-blue-500 hover:underline">
                        Go to Login Page
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-600">
                            Welcome, {userData.user?.email} ({userData.user?.role})
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            View Workspaces
                        </Link>
                        {userData.user?.role === 'admin' && (
                            <Link
                                href="/admin/workspaces"
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                            >
                                Add Workspace
                            </Link>
                        )}
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">You don't have any bookings yet.</p>
                        <Link
                            href="/"
                            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Book a Workspace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{booking.workspace.name}</h3>
                                <div className="space-y-2 text-gray-600 mb-4">
                                    <p><strong>Location:</strong> {booking.workspace.location}</p>
                                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {booking.time}</p>
                                    <p><strong>Booked by:</strong> {booking.name}</p>
                                    <p><strong>Phone:</strong> {booking.phone}</p>
                                    <p><strong>Email:</strong> {booking.email}</p>
                                    <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                                    Confirmed
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
