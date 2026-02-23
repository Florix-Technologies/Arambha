"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
    src: string;
    className?: string;
}

export default function VideoPlayer({ src, className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    // Ensure the state matches the actual video state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, []);

    return (
        <div className={styles.videoContainer}>
            <video
                ref={videoRef}
                src={src}
                className={className}
                autoPlay
                muted
                loop
                playsInline
                onClick={togglePlay}
            />
            <button
                className={styles.playPauseButton}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .94 1.05 1.5 1.83 1.01l10.84-6.86c.73-.46.73-1.55 0-2.01L9.83 4.13c-.78-.49-1.83.07-1.83 1.01z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
