
import React, { useState, useEffect } from 'react';
import AudioPlayer from '@/components/AudioPlayer';

const Index = () => {
  const [audioURL, setAudioURL] = useState('https://assets.codepen.io/296057/fem-bombshell.mp3');
  const [isReady, setIsReady] = useState(false);

  // Listen for messages from parent frame when used in iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message source and format
      if (event.data && typeof event.data === 'object' && 'audioSrc' in event.data) {
        setAudioURL(event.data.audioSrc);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Signal to parent that the iframe is ready to receive messages
    setTimeout(() => {
      window.parent.postMessage({ status: 'ready', type: 'audioPlayer' }, '*');
      setIsReady(true);
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
      <div className="w-full max-w-md animate-scale-in">
        <AudioPlayer 
          audioSrc={audioURL} 
          className={isReady ? "opacity-100" : "opacity-0"}
        />
        
        {/* Instructions for WordPress embedding (visible only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <h2 className="font-semibold mb-2">Embedding Instructions:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Deploy this application.</li>
              <li>Use this code in your WordPress site (with Salient theme):</li>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                {`<iframe 
  src="YOUR_DEPLOYED_URL" 
  width="100%" 
  height="180" 
  frameborder="0" 
  allow="autoplay" 
  class="audio-player-iframe">
</iframe>

<script>
  // Optional: Set custom audio source
  document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.querySelector('.audio-player-iframe');
    
    // Wait for iframe to be ready
    window.addEventListener('message', function(event) {
      if (event.data && event.data.status === 'ready' && 
          event.data.type === 'audioPlayer') {
        // Set your custom audio URL here
        iframe.contentWindow.postMessage({
          audioSrc: 'https://your-audio-file.mp3'
        }, '*');
      }
    });
  });
</script>`}
              </pre>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
