import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import { useLocation } from 'react-router-dom';
import SpaceBackground from './SpaceBackground';
import './Layout.css';

const MainLayout = ({ children }) => {
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
    const location = useLocation();
    const isCleanPage = location.pathname === '/' || location.pathname === '/chat';

    return (
        <div className="nova-layout">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`nova-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {!isCleanPage && <SpaceBackground />}

                {/* Sidebar Toggle Button removed from here to be placed in individual page headers for perfect alignment */}

                {/* Backdrop for closing sidebar on mobile/tablet */}
                {isSidebarOpen && (
                    <div
                        className="nova-sidebar-backdrop"
                        onClick={closeSidebar}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 40,
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                )}

                {/* Glows removed - using global body gradient */}
                <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
