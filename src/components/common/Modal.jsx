import React from 'react';

export function Modal({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className={`relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
