import React from 'react';
import './Nova.css';

const NovaInput = ({ className = '', multiline = false, ...props }) => {
    return (
        <div className="nova-input-wrapper">
            {multiline ? (
                <textarea
                    className={`nova-input ${className}`}
                    {...props}
                    style={{ resize: 'vertical', ...props.style }}
                />
            ) : (
                <input
                    className={`nova-input ${className}`}
                    {...props}
                />
            )}
        </div>
    );
};

export default NovaInput;
