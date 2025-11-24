import React from 'react';
import './Nova.css';

const NovaButton = ({ children, variant = 'default', className = '', ...props }) => {
    // variant: 'default' | 'primary' | 'ghost'
    return (
        <button
            className={`nova-btn nova-btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default NovaButton;
