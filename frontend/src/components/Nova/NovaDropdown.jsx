import React, { useState, useRef, useEffect } from 'react';
import './Nova.css';

const NovaDropdown = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    style = {},
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div
            className={`nova-dropdown-container ${className}`}
            ref={dropdownRef}
            style={{ position: 'relative', width: '100%', ...style }}
        >
            {/* Trigger Button */}
            <div
                className="nova-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: style.fontSize || '0.9rem',
                    transition: 'all 0.2s ease',
                    ...style // Allow overriding height/padding directly
                }}
            >
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '8px'
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="nova-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        background: 'rgba(20, 20, 20, 0.98)', // Solid dark background as requested
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '4px'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="nova-dropdown-item"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                color: option.value === value ? 'var(--accent-primary)' : 'var(--text-primary)',
                                background: option.value === value ? 'rgba(255, 184, 0, 0.1)' : 'transparent',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s ease',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                            onMouseEnter={(e) => {
                                if (option.value !== value) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                if (option.value !== value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NovaDropdown;
