
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioSrc: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Function to toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Update progress in real-time while playing
  const updateProgress = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  // Handle loading metadata
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
    setIsLoaded(true);
  };

  // Handle audio ending
  const handleEnded = () => {
    if (!audioRef.current) return;
    
    // Reset current time and restart
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  // Handle play/pause animations
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Handle unmounting
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Calculate the stroke dash properties for the circular progress
  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className={cn(
      "audio-player-container p-3 bg-player-bg rounded-md shadow-sm backdrop-blur-sm transition-all duration-300 max-w-md mx-auto animate-fade-in",
      isLoaded ? "opacity-100" : "opacity-90",
      className
    )}>
      <audio 
        ref={audioRef}
        src={audioSrc}
        loop
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="flex items-center justify-center w-14 h-14 rounded-md mx-auto">
          <div className="w-10 h-10 rounded-sm bg-black/5 animate-pulse"></div>
        </div>
      )}
      
      {/* Loaded state - Square button with circular progress */}
      {isLoaded && (
        <div className="flex items-center justify-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Circular progress indicator */}
            <svg className="absolute top-0 left-0 -rotate-90 w-full h-full" viewBox="0 0 64 64">
              {/* Background circle */}
              <circle 
                cx="32" 
                cy="32" 
                r={circleRadius} 
                fill="none" 
                stroke="rgba(0,0,0,0.1)" 
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle 
                cx="32" 
                cy="32" 
                r={circleRadius} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray={circleCircumference} 
                strokeDashoffset={strokeDashoffset}
                className="text-player-accent transition-all duration-100"
              />
            </svg>
            
            {/* Square button with transparent background */}
            <button
              onClick={togglePlayPause}
              className="play-button w-10 h-10 flex items-center justify-center bg-transparent rounded-sm focus:outline-none z-10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="text-black w-5 h-5" />
              ) : (
                <Play className="text-black w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
