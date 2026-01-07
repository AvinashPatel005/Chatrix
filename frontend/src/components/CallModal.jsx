import React from 'react';
import {
    StreamCall,
    StreamTheme,
    PaginatedGridLayout,
    CallControls,
    SpeakerLayout
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const CallModal = ({ call, onClose }) => {
    if (!call) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6">
            {/* Force center alignment for Stream's grid layout */}
            <style>{`
                .str-video__paginated-grid-layout {
                    display: flex !important;
                    flex-direction: row !important;
                    align-content: center !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    height: 100% !important;
                }
            `}</style>
            <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-800">
                <StreamTheme className="w-full h-full">
                    <StreamCall call={call}>
                        <div className="relative w-full h-full flex flex-col">
                            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                                <PaginatedGridLayout
                                    iconSize={20}
                                    groupSize={4}
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center z-20 pointer-events-none">
                                <div className="pointer-events-auto">
                                    <CallControls onLeave={onClose} />
                                </div>
                            </div>
                        </div>
                    </StreamCall>
                </StreamTheme>
            </div>
        </div>
    );
};

export default CallModal;
