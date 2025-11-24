import React from 'react';
import './Nova.css';

const NovaSelect = ({ children, className = '', ...props }) => {
    return (
        <div className="nova-select-wrapper">
            <select
                className={`nova-select ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="nova-select-arrow">▼</div>
        </div>
    );
};

export default NovaSelect;
