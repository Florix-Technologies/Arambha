"use client";
import { useState } from "react";
import SmartVideo from "./SmartVideo";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
    src: string;
    className?: string;
}

export default function VideoPlayer({ src, className }: VideoPlayerProps) {
    const [paused, setPaused] = useState(false);
    const togglePlay = () => setPaused((current) => !current);

    return (
        <div className={styles.videoContainer}>
            <SmartVideo src={src} className={className} onClick={togglePlay} userPaused={paused} />
            <button
                className={styles.playPauseButton}
                onClick={togglePlay}
                aria-label={paused ? "Play" : "Pause"}
            >
                {paused ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .94 1.05 1.5 1.83 1.01l10.84-6.86c.73-.46.73-1.55 0-2.01L9.83 4.13c-.78-.49-1.83.07-1.83 1.01z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                )}
            </button>
        </div>
    );
}
