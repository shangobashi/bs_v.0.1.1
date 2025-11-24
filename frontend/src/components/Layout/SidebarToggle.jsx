import React from 'react';
import NovaButton from '../Nova/NovaButton';
import { useSidebar } from '../../context/SidebarContext';

const SidebarToggle = ({ style, className }) => {
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    return (
        <NovaButton
            onClick={toggleSidebar}
            variant="ghost"
            className={className}
            style={{ padding: '0.5rem', ...style }}
            aria-label="Toggle Sidebar"
        >
            {isSidebarOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            )}
        </NovaButton>
    );
};

export default SidebarToggle;
