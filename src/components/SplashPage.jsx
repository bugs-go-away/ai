import React, { useState } from 'react';
import { ArrowRight, Users, MessageSquare, Coffee } from 'lucide-react';

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
			mbti: 'ESTJ',
			hobbies: 'loves debugging',
			funfact: '',
      icon: <Users className='w-6 h-6' />,
      gradient: 'from-blue-500/20 to-transparent',
      color: 'text-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      id: 2,
      name: 'Garrett',
      type: 'Dating',
      bio: 'Garrett is a fun-loving individual who enjoys exploring new restaurants and deep conversations.',
			mbti: 'ESTJ',
			hobbies: 'loves debugging',
			funfact: '',
      icon: <MessageSquare className='w-6 h-6' />,
      gradient: 'from-rose-500/20 to-transparent',
      color: 'text-rose-500',
      borderColor: 'border-rose-200 dark:border-rose-800',
      bgColor: 'bg-rose-50 dark:bg-rose-900/10',
    },
    {
      id: 3,
      name: 'Claire',
      type: 'Casual',
      bio: 'Claire is a laid-back individual and movie enthusiast, perfect for light-hearted conversations and banter.',
			mbti: 'ESTJ',
			hobbies: [''],
			funfact: '',
      icon: <Coffee className='w-6 h-6' />,
      gradient: 'from-green-500/20 to-transparent',
      color: 'text-green-500',
      borderColor: 'border-green-200 dark:border-green-800',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
    },
  ];

	const handleStartGame = async () => {
		if (userName && selectedPerson !== null) {
			const selected = people.find(
				(person) => person.id === selectedPerson
			);
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl'>
        <div className='bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4'>
              Social Skill Builder AI
            </h1>
            <p className='text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto'>
              Practice your conversation skills in different social contexts.
              Choose your conversation partner and see how well you navigate the
              interaction!
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {people.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person.id)}
                onMouseEnter={() => setHoveredPerson(person.id)}
                onMouseLeave={() => setHoveredPerson(null)}
                className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  selectedPerson === person.id
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800'
                    : ''
                }`}
              >
                <div
                  className={`relative rounded-2xl ${person.bgColor} ${person.borderColor} border backdrop-blur-sm overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${person.gradient} opacity-50`}
                  />
                  <div className='relative p-6'>
                    <div
                      className={`${
                        hoveredPerson === person.id ? 'scale-0' : 'scale-100'
                      } transform transition-transform duration-300`}
                    >
                      <div className='flex flex-col items-center'>
                        <div className={`mb-4 ${person.color}`}>
                          {person.icon}
                        </div>
                        <h3 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2'>
                          {person.name}
                        </h3>
                        <p
                          className={`text-sm font-medium ${person.color} uppercase tracking-wide`}
                        >
                          {person.type}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 p-6 flex items-center justify-center ${
                        hoveredPerson === person.id
                          ? 'scale-100 opacity-100'
                          : 'scale-95 opacity-0'
                      } transform transition-all duration-300`}
                    >
                      <p className='text-sm text-slate-600 dark:text-slate-300'>
                        {person.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <input
              type='text'
              placeholder='Enter your name'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className='w-full sm:w-64 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400'
            />
            <button
              onClick={handleStartGame}
              disabled={!userName || selectedPerson === null}
              className='group w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 font-medium'
            >
              Start Conversation
              <ArrowRight className='w-4 h-4 transform transition-transform group-hover:translate-x-1' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
