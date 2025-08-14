'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  role?: string
  isActive: boolean
  createdAt: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvalDate?: string
  approvedBy?: string
  rejectionReason?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'EMPLOYER',
    organization: '',
    phone: '',
    instruments: '',
    qualifications: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewUser({ email: '', name: '', password: '', role: 'EMPLOYER', organization: '', phone: '', instruments: '', qualifications: '' })
        fetchUsers()
        alert('User created successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create user')
      }
    } catch (error) {
      alert('Failed to create user')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action: 'approve' })
      })

      if (response.ok) {
        fetchUsers()
        alert('User approved successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve user')
      }
    } catch (error) {
      alert('Failed to approve user')
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId, 
          action: 'reject',
          rejectionReason 
        })
      })

      if (response.ok) {
        fetchUsers()
        setShowRejectionForm(null)
        setRejectionReason('')
        alert('User rejected successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject user')
      }
    } catch (error) {
      alert('Failed to reject user')
    }
  }

  const handleRejectClick = (userId: string) => {
    setShowRejectionForm(userId)
    setRejectionReason('')
  }

  const handleRejectCancel = () => {
    setShowRejectionForm(null)
    setRejectionReason('')
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage user registrations and approval status
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create User Account
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-800">
                    {users.filter(u => u.approvalStatus === 'PENDING').length}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-xs text-yellow-600">Awaiting approval</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-800">
                    {users.filter(u => u.approvalStatus === 'APPROVED').length}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-xs text-green-600">Active users</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="h-8 w-8 rounded-full bg-red-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-red-800">
                    {users.filter(u => u.approvalStatus === 'REJECTED').length}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-xs text-red-600">Declined registration</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-800">
                    {users.length}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Total</p>
                <p className="text-xs text-blue-600">All users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create User Account</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="EMPLOYER">Employer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                
                {/* Employer-specific fields */}
                {newUser.role === 'EMPLOYER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newUser.organization}
                      onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                    />
                  </div>
                )}

                {/* Teacher-specific fields */}
                {newUser.role === 'TEACHER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instruments</label>
                      <input
                        type="text"
                        placeholder="e.g., Piano, Guitar, Violin"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newUser.instruments}
                        onChange={(e) => setNewUser({ ...newUser, instruments: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                      <textarea
                        placeholder="Teaching qualifications, degrees, certifications..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        value={newUser.qualifications}
                        onChange={(e) => setNewUser({ ...newUser, qualifications: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rejection Form */}
        {showRejectionForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-800">Reject User Registration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this user's registration. This will help them understand why their application was declined.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., Incomplete WWC documentation, Invalid qualifications, etc."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => rejectUser(showRejectionForm)}
                    disabled={!rejectionReason.trim()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject User
                  </button>
                  <button
                    onClick={handleRejectCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="px-6 py-4">Loading users...</li>
            ) : users.length === 0 ? (
              <li className="px-6 py-4">No users found</li>
            ) : (
              users.map((user) => (
                <li key={user.id} className={`px-6 py-4 ${
                  user.approvalStatus === 'PENDING' ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <span className={`inline-block h-3 w-3 rounded-full ${
                            user.isActive ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </p>
                            {user.approvalStatus === 'PENDING' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Rejection reason: {user.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        user.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.approvalStatus}
                      </span>

                      {user.approvalStatus === 'PENDING' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => approveUser(user.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            title="Approve user"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectClick(user.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            title="Reject user"
                          >
                            ✗
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`px-2 py-1 text-xs rounded ${
                          user.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}