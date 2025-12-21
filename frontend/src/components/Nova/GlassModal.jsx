import React, { useEffect } from 'react';
import './Nova.css';

const GlassModal = ({ isOpen, onClose, children, className = '' }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="nova-modal-overlay" onClick={onClose}>
            <div
                className={`nova-modal-content ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="nova-modal-close" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default GlassModal;
