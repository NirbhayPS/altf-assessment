"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

interface Workspace {
  id: string;
  name: string;
  location: string;
  capacity: number;
  createdAt: string;
  creator: {
    email: string;
  };
}

interface UserData {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  userId?: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          const authRes = await fetch('/api/auth/me', { credentials: 'include' });
          if (authRes.ok) {
            const authData = await authRes.json();
            setUserData(authData);
          }
        }

        const workspacesRes = await fetch('/api/workspaces', { credentials: 'include' });
        if (workspacesRes.ok) {
          const workspacesData = await workspacesRes.json();
          setWorkspaces(workspacesData.workspaces);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBookWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowBookingForm(true);
    setValidationErrors({});

    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const timeString = nextHour.getHours().toString().padStart(2, '0') + ':00';
    setBookingForm({
      date: '',
      time: timeString,
      name: '',
      phone: '',
      email: ''
    });
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};


    if (bookingForm.name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters long';
    }

    const cleanPhone = bookingForm.phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!bookingForm.date) {
      errors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(bookingForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Cannot book for past dates';
      }
    }

    if (!bookingForm.time) {
      errors.time = 'Please select a time';
    } else {
      const [hours, minutes] = bookingForm.time.split(':').map(Number);
      if (minutes !== 0) {
        errors.time = 'Booking time must be on the hour (e.g., 14:00, 15:00)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkspace) return;

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          ...bookingForm
        }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Booking created successfully!');
        setShowBookingForm(false);
        setSelectedWorkspace(null);
        setBookingForm({
          date: '',
          time: '',
          name: '',
          phone: '',
          email: ''
        });
        setValidationErrors({});
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Error creating booking');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!userData?.authenticated) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
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
            <h1 className="text-3xl font-bold text-gray-900">Workspace Management</h1>
            <p className="text-gray-600">
              Welcome, {userData.user?.email || 'User'} ({userData.user?.role || 'user'})
            </p>
          </div>
          <div className="flex gap-4">
            {userData.user?.role === 'user' && <Link
              href="/bookings"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              My Bookings
            </Link>}
            {userData.user?.role === 'admin' && (
              <Link
                href="/admin/workspaces"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Workspace
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{workspace.name}</h3>
              <div className="space-y-2 text-gray-600 mb-4">
                <p><strong>Location:</strong> {workspace.location}</p>
                <p><strong>Capacity:</strong> {workspace.capacity} people</p>
                <p><strong>Created by:</strong> {workspace.creator.email}</p>
                <p><strong>Created:</strong> {new Date(workspace.createdAt).toLocaleDateString()}</p>
              </div>
              {userData.user?.role === 'user' && <button
                onClick={() => handleBookWorkspace(workspace)}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              >
                Book Workspace
              </button>}
            </div>
          ))}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No workspaces available.</p>
          </div>
        )}
      </div>

      {showBookingForm && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Book: {selectedWorkspace.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date and 1-hour time slot for your booking.
            </p>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={bookingForm.date}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (1-hour slot) *</label>
                <input
                  type="time"
                  name="time"
                  required
                  step="3600"
                  value={bookingForm.time}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {validationErrors.time && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.time}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Select time on the hour (e.g., 14:00, 15:00)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (min 3 characters) *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={bookingForm.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={bookingForm.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="1234567890"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={bookingForm.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="your.email@example.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedWorkspace(null);
                    setValidationErrors({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}