import React from 'react';
import ChatContainer from './components/ChatContainer';
import ResponsiveAppBar from './components/AppBar';
import SplashPage from './components/SplashPage';

function App() {
  return (
    <>
      <SplashPage />
      <ResponsiveAppBar />
      <ChatContainer />
    </>
  );
}

export default App;

// <ChatSidebarContainer />
