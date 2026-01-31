'use client'

import React, { useState } from 'react'
import Toast from '@/components/Toast'

interface AdminSubmitQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AdminQuestionSubmission) => Promise<void>
  isLoading?: boolean
}

export interface AdminQuestionSubmission {
  question: string
  description: string
  endDate: string
  endTime: string
  photo: File | null
  category: string
}

const AVAILABLE_CATEGORIES = [
  'Sports',
  'Crypto',
  'Politics',
  'Tech',
  'Finance',
  'Entertainment',
  'Science',
  'Weather',
  'Business',
  'Gaming',
]

export default function AdminSubmitQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AdminSubmitQuestionModalProps) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isClosing, setIsClosing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }
    if (!endDate) {
      newErrors.endDate = 'End date must be selected'
    }
    if (!endTime) {
      newErrors.endTime = 'End time must be selected'
    }
    if (!photo) {
      newErrors.photo = 'Photo must be uploaded'
    }
    if (!category) {
      newErrors.category = 'Select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit({
          question,
          description,
          endDate,
          endTime,
          photo,
          category,
        })
        setToast({
          message: 'Question created and approved successfully!',
          type: 'success',
          isVisible: true
        })
        resetForm()
        setTimeout(() => handleClose(), 1500)
      } catch (error) {
        setToast({
          message: 'Failed to create question. Please try again.',
          type: 'error',
          isVisible: true
        })
      }
    }
  }

  const resetForm = () => {
    setQuestion('')
    setDescription('')
    setEndDate('')
    setEndTime('')
    setPhoto(null)
    setPhotoPreview('')
    setCategory('')
    setErrors({})
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      resetForm()
      setIsClosing(false)
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[150] bg-black/60 flex items-end md:items-center justify-center ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in'
        }`}
      onClick={handleClose}
    >
      <div
        className={`w-full md:max-w-2xl rounded-t-4xl md:rounded-3xl shadow-2xl ${isClosing
            ? 'animate-out slide-out-to-bottom md:slide-out-to-center duration-300'
            : 'animate-in slide-in-from-bottom md:slide-in-from-center duration-300'
          } max-h-[90vh] overflow-y-auto`}
        style={{ backgroundColor: '#FCF9E1' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div
          className="flex justify-center py-4 md:hidden cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientY)}
          onTouchMove={(e) => setTouchEnd(e.touches[0].clientY)}
          onTouchEnd={() => {
            if (touchStart - touchEnd < -50) {
              handleClose()
            }
            setTouchStart(0)
            setTouchEnd(0)
          }}
        >
          <div className="w-12 h-1 rounded-full bg-gray-400" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b-2" style={{ backgroundColor: '#FCF9E1' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Question</h2>
            <p className="text-sm text-gray-600 mt-1">This will be auto-approved</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Question Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Question <span className="text-[#CC0D00]">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: Will Real Madrid win El Clásico?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none font-medium disabled:bg-gray-100"
              rows={4}
              disabled={isLoading}
            />
            {errors.question && (
              <p className="text-[#CC0D00] text-sm mt-1 font-medium">{errors.question}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this question..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none font-medium disabled:bg-gray-100"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* End Date Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              End Date & Time <span className="text-[#CC0D00]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium disabled:bg-gray-100"
                  disabled={isLoading}
                />
                {errors.endDate && (
                  <p className="text-[#CC0D00] text-sm mt-1 font-medium">{errors.endDate}</p>
                )}
              </div>
              <div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium disabled:bg-gray-100"
                  disabled={isLoading}
                />
                {errors.endTime && (
                  <p className="text-[#CC0D00] text-sm mt-1 font-medium">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Photo <span className="text-[#CC0D00]">*</span>
            </label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview || "/Logo-Titen.png"}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview('')
                  }}
                  className="absolute top-2 right-2 bg-[#CC0D00] text-white p-2 rounded-full hover:bg-[#FE7B72] disabled:opacity-50"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p className="text-gray-600 font-medium mb-1">Click to upload photo</p>
                <p className="text-gray-500 text-sm">or drag & drop</p>
              </label>
            )}
            {errors.photo && (
              <p className="text-[#CC0D00] text-sm mt-1 font-medium">{errors.photo}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Category <span className="text-[#CC0D00]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium disabled:bg-gray-100"
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {AVAILABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-[#CC0D00] text-sm mt-1 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: isLoading ? '#ccc' : 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}
          >
            {isLoading ? 'Creating...' : 'Create & Approve'}
          </button>
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
