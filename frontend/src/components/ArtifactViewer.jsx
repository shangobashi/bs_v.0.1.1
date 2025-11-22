import React, { useState } from 'react';
import '../styles/components.css';

function ArtifactViewer({ artifacts, isOpen, onClose }) {
    const [selectedArtifact, setSelectedArtifact] = useState(Object.keys(artifacts)[0]);

    if (!isOpen || !artifacts || Object.keys(artifacts).length === 0) return null;

    return (
        <div className="artifact-viewer-overlay">
            <div className="artifact-viewer">
                <div className="artifact-header">
                    <h3>Project Artifacts</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="artifact-content-wrapper">
                    <div className="artifact-list">
                        {Object.keys(artifacts).map(key => (
                            <button
                                key={key}
                                className={`artifact-tab ${selectedArtifact === key ? 'active' : ''}`}
                                onClick={() => setSelectedArtifact(key)}
                            >
                                {key}
                            </button>
                        ))}
                    </div>

                    <div className="artifact-display">
                        <pre>
                            {JSON.stringify(artifacts[selectedArtifact], null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArtifactViewer;
