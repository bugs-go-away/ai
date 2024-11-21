import React, { useState } from 'react';

const SplashPage = ({ onStartGame }) => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [userName, setUserName] = useState('');

  const people = [
    {
      id: 1,
      name: 'Noah',
      type: 'Networking',
      bio: 'Noah is a seasoned tech professional who loves talking about industry trends and startups.',
    },
    {
      id: 2,
      name: 'Garrett',
      type: 'Dating',
      bio: 'Garrett is a fun-loving individual who enjoys exploring new restaurants and deep conversations.',
    },
    {
      id: 3,
      name: 'Claire',
      type: 'Casual',
      bio: 'Claire is a laid-back individual and movie enthusiast, perfect for light-hearted conversations and banter.',
    },
  ];

  const handlePersonClick = (id) => {
    setSelectedPerson(id);
  };

  const handleHover = (id) => {
    setHoveredPerson(id);
  };

  const handleMouseOut = () => {
    setHoveredPerson(null);
  };

  const handleStartGame = async () => {
    if (userName && selectedPerson !== null) {
      const selected = people.find((person) => person.id === selectedPerson);
      try {
        const response = await fetch(
          `http://localhost:3000/chat/init?opponentId=${selected.id}&username=${userName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Chat Initialized: ', data);
          onStartGame(userName, selected);
        } else {
          alert('Failed to initialize chat');
        }
      } catch (error) {
        console.error('Error initializing: ', error);
        alert('An error has occurred, try again');
      }
    } else {
      alert('Please enter your name and select a person to start!');
    }
  };

  return (
    <div className='text-center font-sans p-6'>
      <h1 className='text-3xl font-bold mb-4'>
        Welcome to Social Skill Builder AI
      </h1>
      <p className='text-lg mb-6'>
        In this game, you will engage in different contextual conversations.
        Choose your conversation type and see how well you navigate the
        interaction!
      </p>

      <div className='flex justify-center gap-6 mb-6'>
        {people.map((person) => (
          <div
            key={person.id}
            className={`p-4 border-2 rounded-lg transition-transform duration-200 
              ${
                selectedPerson === person.id
                  ? 'border-blue-500'
                  : 'border-transparent'
              } 
              hover:scale-105 cursor-pointer`}
            onClick={() => handlePersonClick(person.id)}
            onMouseEnter={() => handleHover(person.id)}
            onMouseLeave={handleMouseOut}
          >
            <div className='relative w-36 h-36 overflow-hidden rounded-lg bg-gray-100'>
              {hoveredPerson === person.id ? (
                <div className='flex items-center justify-center h-full text-sm text-gray-700 p-2'>
                  <p>{person.bio}</p>
                </div>
              ) : (
                <img
                  src={`https://via.placeholder.com/150?text=${person.name}`}
                  alt={`${person.name}`}
                  className='w-full h-full object-cover'
                />
              )}
            </div>
            <h3 className='mt-2 font-medium'>{person.name}</h3>
            <p className='text-sm text-gray-600'>{person.type}</p>
          </div>
        ))}
      </div>

      <div className='flex justify-center items-center gap-4'>
        <input
          type='text'
          placeholder='Enter your name'
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={handleStartGame}
          className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
        >
          Start Conversation
        </button>
      </div>
    </div>
  );
};

export default SplashPage;
