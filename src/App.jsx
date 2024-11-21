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

  const resetGame = () => {
    setGameStarted(false);
    setSelectedPerson(null);
    setUserName('');
  };

  return (
    <>
      <ResponsiveAppBar selectedPerson={selectedPerson} />
      {!gameStarted ? (
        <SplashPage onStartGame={handleStartGame} />
      ) : (
        <ChatContainer
          username={userName}
          opponent={selectedPerson}
          onReset={resetGame}
        />
      )}
    </>
  );
}

export default App;
