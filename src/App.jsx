import React, { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import ResponsiveAppBar from './components/AppBar';
import SplashPage from './components/SplashPage';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [userName, setUserName] = useState('');

  const handleStartGame = (name, person) => {
    setUserName(name);
    setSelectedPerson(person);
    setGameStarted(true);
  };

  return (
    <>
      <ResponsiveAppBar />
      {!gameStarted ? (
        <SplashPage onStartGame={handleStartGame} />
      ) : (
        <ChatContainer username={userName} opponent={selectedPerson} />
      )}
    </>
  );
}

export default App;
