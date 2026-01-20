'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/Toast'
import type { Question } from '@/lib/supabase'

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  useEffect(() => {
    fetchQuestions()
  }, [filter])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching questions:', error)
      } else {
        setQuestions(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating status:', error)
        setToast({
          message: 'Failed to update status. Please try again.',
          type: 'error',
          isVisible: true
        })
      } else {
        setToast({
          message: `Question ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
          type: 'success',
          isVisible: true
        })
        fetchQuestions()
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({
        message: 'Failed to update status. Please try again.',
        type: 'error',
        isVisible: true
      })
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#FCF9E1' }}>
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-20 px-4 md:px-8 pt-4 md:pt-8" style={{ backgroundColor: '#FCF9E1' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Admin Questions</h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  filter === f
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={filter === f ? { background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' } : undefined}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600 font-medium">Loading questions...</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-gray-600 font-medium">No questions found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                {/* Image */}
                {question.photo_url ? (
                  <div className="w-full h-48 bg-gray-200 relative">
                    <img 
                      src={question.photo_url} 
                      alt={question.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', question.photo_url)
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center"><span class="text-5xl">📷</span></div>'
                        }
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-5xl">📷</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      question.status === 'approved' ? 'bg-[#94E172] text-[#2A8300]' :
                      question.status === 'rejected' ? 'bg-[#FE7B72] text-[#CC0D00]' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {question.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {question.title}
                  </h3>

                  {/* Date & Category Row */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <div className="text-gray-500 font-medium mb-1">Date & Time</div>
                      <div className="text-gray-900 font-semibold text-xs">
                        {question.end_date}
                        <br />
                        {question.end_time}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium mb-1">Category</div>
                      <div className="text-gray-900 font-semibold text-xs line-clamp-2">
                        {question.category}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {question.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button
                        onClick={() => updateStatus(question.id, 'approved')}
                        className="px-4 py-3 bg-[#2A8300] hover:bg-[#94E172] text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateStatus(question.id, 'rejected')}
                        className="px-4 py-3 bg-[#CC0D00] hover:bg-[#FE7B72] text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                  
                  {question.status !== 'pending' && (
                    <div className="text-sm text-gray-500 mt-auto pt-3 border-t">
                      Updated: {new Date(question.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
