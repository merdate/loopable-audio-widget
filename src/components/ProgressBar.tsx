
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

const ProgressBar = ({
  duration,
  currentTime,
  onSeek,
  isPlaying
}: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Calculate the display position for the indicator (either from drag or current time)
  const displayPosition = isDragging && dragPosition !== null
    ? dragPosition
    : percentage;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateDragPosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateDragPosition(e);
    }
  };

  const updateDragPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setDragPosition(Math.max(0, Math.min(position, 100)));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && dragPosition !== null && progressRef.current) {
      const newTime = (dragPosition / 100) * duration;
      onSeek(newTime);
      setIsDragging(false);
      setDragPosition(null);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging && dragPosition !== null) {
        const newTime = (dragPosition / 100) * duration;
        onSeek(newTime);
        setIsDragging(false);
        setDragPosition(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging, dragPosition, duration, onSeek]);

  return (
    <div 
      ref={progressRef}
      className="w-full h-1.5 rounded-full bg-black/10 relative cursor-pointer group"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        className={cn(
          "absolute h-full rounded-full bg-player-progress transition-all duration-100",
          isPlaying && !isDragging ? "transition-all duration-100" : ""
        )}
        style={{ width: `${displayPosition}%` }}
      />
      <div 
        className="audio-progress-indicator absolute top-1/2 -mt-1.5 -ml-1.5 w-3 h-3 rounded-full bg-player-accent shadow-sm opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        style={{ left: `${displayPosition}%` }}
      />
    </div>
  );
};

export default ProgressBar;
