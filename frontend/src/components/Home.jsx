import React from 'react';

import GlassCard from './Nova/GlassCard';
import NovaButton from './Nova/NovaButton';
import SidebarToggle from './Layout/SidebarToggle';
import './Home.css';
import heroImage from '../assets/nova_hero_woman.png';

const Home = () => {
    const [billingCycle, setBillingCycle] = React.useState('yearly');

    return (
        <div className="nova-home-v3">
            {/* Top Navigation */}
            <nav className="nova-top-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SidebarToggle />
                    <div className="nav-logo">Blue Swarm AI</div>
                </div>
                <div className="nav-actions">
                    <button className="nav-link">Log in</button>
                    <button className="nav-cta">Sign up</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="nova-hero-v3">
                <div className="hero-background">
                    <img src={heroImage} alt="Blue Swarm AI" />
                    <div className="hero-overlay-gradient"></div>
                </div>

                <div className="hero-content-centered">
                    <h1>Empathetic AI for a<br />Human-Centric World</h1>

                    <div className="trusted-by">
                        <span>TRUSTED BY INDUSTRY LEADERS</span>
                        <div className="logos">
                            <span className="logo-text">Forbes</span>
                            <span className="logo-text">TechCrunch</span>
                            <span className="logo-text">WIRED</span>
                            <span className="logo-text">FAST COMPANY</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Data Bento Grid Section */}
            <section className="nova-bento-section">
                <h2 className="section-title">Data Bento Grid</h2>

                <div className="bento-grid-v3">
                    {/* Efficiency Gains */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Efficiency Gains</span>
                            <span className="card-value">+45%</span>
                        </div>
                        <div className="chart-container">
                            <svg viewBox="0 0 100 40" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                <path d="M0,35 Q20,30 40,20 T100,5" fill="none" stroke="#FFB800" strokeWidth="2" />
                                <circle cx="40" cy="20" r="3" fill="#FFB800" />
                                <circle cx="100" cy="5" r="3" fill="#FFB800" />
                                <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FFB800" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
                                </linearGradient>
                                <path d="M0,35 Q20,30 40,20 T100,5 V40 H0 Z" fill="url(#glow)" />
                            </svg>
                        </div>
                    </GlassCard>

                    {/* Global Reach */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Global Reach</span>
                        </div>
                        <div className="chart-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '120px', minWidth: '120px' }}>
                            <svg viewBox="0 0 100 100" width="100px" height="100px" style={{ minWidth: '100px', minHeight: '100px' }}>
                                <circle cx="50" cy="50" r="40" stroke="rgba(255,184,0,0.1)" strokeWidth="8" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="#FFB800" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="60" transform="rotate(-90 50 50)" />
                                <circle cx="50" cy="50" r="25" stroke="#FF5C00" strokeWidth="6" fill="none" strokeDasharray="157" strokeDashoffset="40" transform="rotate(-90 50 50)" />
                            </svg>
                        </div>
                    </GlassCard>

                    {/* Data Evolution */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Data evolution</span>
                        </div>
                        <div className="chart-container" style={{ alignItems: 'flex-end', gap: '4px', minHeight: '100px' }}>
                            {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    height: `${h}%`,
                                    background: i % 2 === 0 ? '#FFB800' : 'rgba(255,184,0,0.3)',
                                    borderRadius: '2px 2px 0 0'
                                }}></div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Data Analysis */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Data analysis</span>
                        </div>
                        <div className="chart-container" style={{ flexDirection: 'column', justifyContent: 'space-around' }}>
                            {[85, 45, 60, 30].map((w, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                        <div style={{ width: `${w}%`, height: '100%', background: '#FFB800', borderRadius: '3px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#888', width: '25px' }}>{w}%</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Data Injection */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Data injection</span>
                            <span className="card-value">+4.5%</span>
                        </div>
                        <div className="chart-container" style={{ alignItems: 'flex-end', gap: '8px' }}>
                            {[30, 50, 80, 40, 90].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    height: `${h}%`,
                                    background: '#FF5C00',
                                    borderRadius: '2px 2px 0 0',
                                    opacity: 0.8
                                }}></div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Tools Beta */}
                    <GlassCard className="bento-card">
                        <div className="card-header">
                            <span className="card-label">Tools beta</span>
                        </div>
                        <div className="chart-container">
                            <svg viewBox="0 0 100 40" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                <path d="M0,30 L25,15 L50,25 L75,10 L100,20" fill="none" stroke="#FFB800" strokeWidth="1.5" />
                                <circle cx="75" cy="10" r="3" fill="#FFF" />
                                <path d="M0,30 L25,15 L50,25 L75,10 L100,20 V40 H0 Z" fill="url(#glow)" />
                            </svg>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="nova-features-section">
                <h2 className="section-title">Features</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <h3>Constraint-Driven Excellence</h3>
                        <p>We don't just build for Africa; we use African constraints to build better software for the world. Offline-first, mobile-centric, and resource-efficient by design.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Ubuntu Architecture</h3>
                        <p>Components talk to each other clearly. No hidden assumptions. Mentorship built into code structure. Success is collective.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Diaspora Bridge</h3>
                        <p>Deliberate bridges between diaspora knowledge and home innovation. Global market understanding grounded in local reality.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="nova-pricing-section">
                <h2 className="section-title">Pricing</h2>

                {/* Billing Toggle */}
                <div className="billing-toggle-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: billingCycle === 'monthly' ? '#FFF' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setBillingCycle('monthly')}>Monthly</span>
                    <div
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        style={{
                            width: '50px',
                            height: '26px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '13px',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#FFB800',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: billingCycle === 'monthly' ? '3px' : '25px',
                            transition: 'left 0.3s ease'
                        }} />
                    </div>
                    <span style={{ color: billingCycle === 'yearly' ? '#FFF' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setBillingCycle('yearly')}>Yearly <span style={{ fontSize: '0.7rem', color: '#FFB800', marginLeft: '4px' }}>(Promo)</span></span>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h3>Community</h3>
                        <div className="pricing-price">{billingCycle === 'monthly' ? '$199' : '$99'}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>per month</div>
                        <ul className="pricing-features">
                            <li>✓ Free 1 Day Trial</li>
                            <li>✓ 3 Active Agents</li>
                            <li>✓ Basic Documentation</li>
                            <li>✓ Community Support</li>
                        </ul>
                        <NovaButton variant="ghost">Get Started</NovaButton>
                    </div>
                    <div className="pricing-card highlight">
                        <h3>Professional</h3>
                        <div className="pricing-price">{billingCycle === 'monthly' ? '$1999' : '$999'}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>per month</div>
                        <ul className="pricing-features">
                            <li>✓ 24 Active Agents</li>
                            <li>✓ Full Ubuntu Architecture</li>
                            <li>✓ Priority Support</li>
                        </ul>
                        <NovaButton variant="primary">Start Trial</NovaButton>
                    </div>
                    <div className="pricing-card">
                        <h3>Custom</h3>
                        <div className="pricing-price">Custom</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Contact Us</div>
                        <ul className="pricing-features">
                            <li>✓ +64 Agents across +4 Swarms</li>
                            <li>✓ On-Premise Deployment</li>
                            <li>✓ Custom Training</li>
                            <li>✓ 24/7 Dedicated Team</li>
                        </ul>
                        <NovaButton variant="ghost">Contact Us</NovaButton>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="nova-about-section">
                <div className="about-content">
                    <h2>About Blue Pads Labs</h2>
                    <p>
                        Blue Pads Labs centers Afro-centric identity as the competitive advantage for software engineering itself.
                        "I am because we are." In software engineering, this means we code because we're building something that matters to our communities.
                    </p>
                    <p>
                        Our decisions honor interdependence, not just individual brilliance. We build systems that honor resilience and human connection.
                    </p>
                    <NovaButton variant="default">Read Manifesto</NovaButton>
                </div>
            </section>
        </div>
    );
};

export default Home;
