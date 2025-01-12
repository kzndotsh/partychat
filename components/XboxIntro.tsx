'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from 'lucide-react';
import { logWithContext } from '@/lib/logger';

interface XboxIntroProps {
  onIntroEnd: () => void;
}

export function XboxIntro({ onIntroEnd }: XboxIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const attemptPlay = async () => {
        try {
          await videoElement.play();
          setIsMuted(false);
          logWithContext('XboxIntro.tsx', 'attemptPlay', 'Video playing with sound.');
        } catch (error) {
          logWithContext('XboxIntro.tsx', 'attemptPlay', `Autoplay with sound failed: ${error}`);
          videoElement.muted = true;
          setIsMuted(true);
          try {
            await videoElement.play();
            logWithContext('XboxIntro.tsx', 'attemptPlay', 'Video playing muted.');
          } catch (mutedError) {
            logWithContext('XboxIntro.tsx', 'attemptPlay', `Autoplay even when muted failed: ${mutedError}`);
          }
        }
      };

      attemptPlay();

      videoElement.onended = () => {
        logWithContext('XboxIntro.tsx', 'videoElement.onended', 'Video ended.');
        onIntroEnd();
      };
    }
  }, [onIntroEnd]);

  const handleSkip = () => {
    logWithContext('XboxIntro.tsx', 'handleSkip', 'Intro skipped.');
    onIntroEnd();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
      logWithContext('XboxIntro.tsx', 'toggleMute', `Mute toggled to ${!isMuted}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sirte_4-WPMUIrD20Lz0kDYC1Gqzl8ymIljn6M.mp4"
        playsInline
        loop={false}
      />
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button
          onClick={toggleMute}
          className="bg-white text-black hover:bg-gray-200 rounded-md px-4 py-2 font-semibold transition-all duration-300"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </Button>
        <Button
          onClick={handleSkip}
          className="bg-white text-black hover:bg-gray-200 rounded-md px-4 py-2 font-semibold transition-all duration-300 animate-slow-pulse"
        >
          Skip Intro
        </Button>
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes slow-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  .animate-slow-pulse {
    animation: slow-pulse 3s ease-in-out infinite;
  }
`}</style>