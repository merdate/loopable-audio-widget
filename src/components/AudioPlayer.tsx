
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import ProgressBar from './ProgressBar';
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

  // Handle seeking
  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
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

  return (
    <div className={cn(
      "audio-player-container p-6 bg-player-bg rounded-2xl shadow-md backdrop-blur-sm transition-all duration-300 max-w-md w-full mx-auto animate-fade-in",
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
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-black/5 animate-pulse"></div>
          <div className="w-full h-1.5 rounded-full bg-black/5 animate-pulse"></div>
        </div>
      )}
      
      {/* Loaded state */}
      {isLoaded && (
        <div className="flex flex-col space-y-6">
          <button
            onClick={togglePlayPause}
            className="play-button mx-auto w-16 h-16 flex items-center justify-center bg-player-button rounded-full shadow-lg focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="text-player-accent w-8 h-8" />
            ) : (
              <Play className="text-player-accent w-8 h-8 ml-1" />
            )}
          </button>
          
          <div className="space-y-2">
            <ProgressBar 
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              isPlaying={isPlaying}
            />
            
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time in mm:ss
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default AudioPlayer;
