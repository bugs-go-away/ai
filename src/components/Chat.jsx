import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebarContainer from './ChatSidebarContainer'

export default function Chat() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4'>
      <div className='bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl'>
        <div className='text-center'>
          <h1 className='text-6xl font-bold text-white mb-8 font-mono tracking-wider'>
            AI Chat
          </h1>
					<ChatSidebarContainer />
        </div>
      </div>
    </div>
  );
}
