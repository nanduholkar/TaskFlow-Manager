import React from 'react'

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
      
      {/* Overlay click */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative p-4 w-full max-w-2xl max-h-full z-10">
        <div className="bg-white rounded-lg shadow-sm ">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-400">
            <h3 className="text-lg font-medium text-gray-900 ">
              {title}
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Modal