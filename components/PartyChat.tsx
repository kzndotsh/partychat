'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Clipboard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { JoinPartyModal } from '@/components/JoinPartyModal';
import MemberList from '@/components/MemberList';
import { PartyHeader } from '@/components/PartyHeader';
import { PartyControls } from '@/components/PartyControls';
import { usePartyState } from '@/lib/hooks/usePartyState';
import { useCurrentTime } from '@/lib/hooks/useCurrentTime';
import { useVoiceChat } from '@/lib/hooks/useVoiceChat';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function PartyChat() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const {
    members,
    currentUser,
    storedAvatar,
    volumeLevel,
    isMuted,
    toggleMute,
    joinParty,
    editProfile,
    leaveParty,
  } = usePartyState();

  const { micPermissionDenied, requestMicrophonePermission } = useVoiceChat();
  const currentTime = useCurrentTime();

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      setShowJoinModal(true);
    }
  }, []);

  const handleJoinParty = async (username: string, avatar: string, status: string) => {
    try {
      await joinParty(username, avatar, status);
    } catch (error) {
      console.error('Failed to join party:', error);
      return;
    }
    setShowJoinModal(false);
  };

  const handleJoinClick = async () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        await joinParty(user.name, user.avatar, user.game);
      } catch (error) {
        console.error('Failed to join with stored data:', error);
        setShowJoinModal(true);
      }
    } else {
      setShowJoinModal(true);
    }
  };

  const handleEditProfile = (username: string, avatar: string, status: string) => {
    editProfile(username, avatar, status);
    setShowEditModal(false);
  };

  const handleToggleMute = async () => {
    if (currentUser) {
      try {
        await toggleMute(currentUser.id);
      } catch (error) {
        console.error('Failed to toggle mute:', error);
      }
    }
  };

  const handleLeaveParty = async () => {
    try {
      await leaveParty();
    } catch (error) {
      console.error('Failed to leave party:', error);
    }
  };

  // Fill empty rows to maintain consistent height
  const emptyRows = Array(Math.max(0, 7 - members.length))
    .fill(null)
    .map((_, index) => ({
      id: `empty-${index}`,
      name: '',
      game: '',
      muted: false,
      avatar: '',
    }));

  const allRows = [...members, ...emptyRows];

  return (
    <ErrorBoundary>
      <div className='min-h-screen relative flex items-center justify-center bg-black tracking-wide overflow-hidden'>
        {/* Video Background */}
        <div className='absolute inset-0 z-0'>
          <video
            autoPlay
            loop
            muted
            playsInline
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover'
            style={{ filter: 'blur(6px)' }}>
            <source
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg%20vid-IrN6ZDtoQMHnThmO35MvmafQ4ccLAo.mp4'
              type='video/mp4'
            />
          </video>
        </div>

        <div className='absolute inset-0 bg-black opacity-55 z-10' />

        <div className='relative z-20 w-full max-w-[825px] mx-auto p-4 sm:p-6'>
          {/* Header */}
          <div className='flex items-end justify-between mb-2'>
            <h1 className='text-lg text-white pl-[30px]'>$360</h1>
            <button
              onClick={() => setShowEditModal(true)}
              className='flex flex-col items-center justify-center group'>
              <img
                src={currentUser?.avatar || storedAvatar || '/placeholder.svg'}
                alt='Profile'
                className='w-[47px] h-[47px] sm:w-[64px] sm:h-[64px] object-cover mb-1 transition-transform duration-200 ease-in-out group-hover:scale-110 group-hover:shadow-lg'
              />
              <div className='w-full h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-in-out' />
            </button>
            <div className='text-right text-white pr-[30px]'>
              <span className='text-lg' suppressHydrationWarning>
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <Card className='bg-[#f0f0fa] border-0 mb-2 rounded-none relative overflow-hidden shadow-none text-[#161718] aspect-[16/9.75]'>
            <PartyHeader membersCount={members.length} />

            {/* Invite Button */}
            <div className='bg-gradient-to-b from-[#70cc00] to-[#409202] py-[6px] pl-[30px] cursor-pointer hover:brightness-110 transition-all flex items-center gap-2 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]'>
              <span className='font-medium text-[1.15rem] text-white'>
                Copy CA
              </span>
              <Clipboard className='w-3.5 h-3.5 text-white' />
            </div>

            {/* Party Options */}
            <div className='py-[6px] pl-[30px] text-[#282b2f] border-b border-gray-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.08)]'>
              <span className='font-medium text-[1.15rem]'>
                Party Options: Party Chat
              </span>
            </div>

            {/* Member List */}
            <MemberList
              members={allRows}
              toggleMute={toggleMute}
              volumeLevel={volumeLevel}
              currentUserId={currentUser?.id}
            />
          </Card>

          <PartyControls
            currentUser={currentUser}
            storedAvatar={storedAvatar}
            onJoin={handleJoinClick}
            onLeave={handleLeaveParty}
            onToggleMute={handleToggleMute}
            onEdit={() => setShowEditModal(true)}
            volumeLevel={volumeLevel}
            micPermissionDenied={micPermissionDenied}
            onRequestMicrophonePermission={requestMicrophonePermission}
            isMuted={isMuted}
          />
        </div>
      </div>
      
      {showJoinModal && (
        <JoinPartyModal
          onJoin={handleJoinParty}
          initialData={currentUser ? {
            username: currentUser.name,
            avatar: currentUser.avatar,
            status: currentUser.game,
          } : undefined}
        />
      )}

      {showEditModal && (
        <JoinPartyModal
          onJoin={handleEditProfile}
          onCancel={() => setShowEditModal(false)}
          initialData={currentUser ? {
            username: currentUser.name,
            avatar: currentUser.avatar,
            status: currentUser.game,
          } : undefined}
          isEditMode={true}
        />
      )}
    </ErrorBoundary>
  );
}