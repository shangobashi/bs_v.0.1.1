import React from 'react';
import './Nova.css';

const GlassCard = ({ children, className = '', interactive = false, ...props }) => {
    return (
        <div
            className={`nova-card ${interactive ? 'interactive' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
