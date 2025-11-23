import React from 'react';
import '../css/TabletNotSupported.css';
import Logo from '../assets/Logo5.png';

const TabletNotSupported = () => {
    return (
        <div className="tablet-not-supported">
            <div className="tablet-not-supported-content">
                <div className="tablet-info-card">
                    <div className="tablet-header-icons">
                        <img src={Logo} alt="Spyzer" className="tablet-logo" />
                        <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="tablet-title">Platform Not Available</h1>

                    <div className="tablet-divider"></div>

                    <p className="tablet-message">
                        This application is not optimized for tablet devices.
                    </p>

                    <p className="tablet-suggestion">
                        To access all platform features, please use a compatible device:
                    </p>

                    <div className="supported-devices">
                        <div className="device-item">
                            <div className="device-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
                                </svg>
                            </div>
                            <span className="device-label">Mobile Device</span>
                        </div>

                        <div className="device-separator"></div>

                        <div className="device-item">
                            <div className="device-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
                                </svg>
                            </div>
                            <span className="device-label">Desktop Computer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabletNotSupported;
