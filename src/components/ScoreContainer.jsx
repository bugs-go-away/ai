import React from 'react';
import { Trophy, Target, Star, ArrowRight } from 'lucide-react';

const ScoreContainer = ({ score, feedback, onNewConversation }) => {
  const maxScore = 10;
  const scorePercentage = (score / maxScore) * 100;

  const getScoreInfo = () => {
    if (score >= 8) {
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/10',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: <Trophy className='w-8 h-8 text-green-500' />,
        message: 'Excellent!',
        gradient: 'from-green-500/20 to-transparent',
      };
    } else if (score >= 6) {
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: <Star className='w-8 h-8 text-yellow-500' />,
        message: 'Good Job!',
        gradient: 'from-yellow-500/20 to-transparent',
      };
    } else {
      return {
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/10',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: <Target className='w-8 h-8 text-blue-500' />,
        message: 'Keep Going!',
        gradient: 'from-blue-500/20 to-transparent',
      };
    }
  };

  const { color, bgColor, borderColor, icon, message, gradient } =
    getScoreInfo();

  const renderStars = () => {
    return (
      <div className='flex gap-1.5'>
        {[...Array(maxScore)].map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < score
                ? `${color.replace('text-', 'bg-')} scale-100`
                : 'bg-slate-200 dark:bg-slate-600 scale-75'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className='w-full max-w-4xl'>
      <div className='bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden'>
        <div className='p-8'>
          <div className='pb-4'>
            <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-200'>
              Conversation Rating
            </h2>
          </div>

          <div className='flex flex-col md:flex-row gap-8'>
            {/* Score Card */}
            <div className='md:w-1/3'>
              <div
                className={`relative rounded-2xl ${bgColor} ${borderColor} border backdrop-blur-sm overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`}
                />
                <div className='relative p-6'>
                  <div className='flex flex-col items-center'>
                    <div className='mb-3 transform transition-transform hover:scale-110'>
                      {icon}
                    </div>
                    <div className={`text-4xl font-bold ${color} mb-2`}>
                      {score.toFixed(1)}
                      <span className='text-lg font-normal opacity-75'>
                        /10
                      </span>
                    </div>
                    {renderStars()}
                    <div
                      className={`text-sm font-semibold ${color} mt-3 uppercase tracking-wide`}
                    >
                      {message}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className='flex-1'>
              <div className='h-full flex flex-col'>
                <div className='flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-6'>
                  <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3'>
                    Feedback
                  </h3>
                  <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
                    {feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='mt-8 flex justify-center'>
            <button
              onClick={onNewConversation}
              className='group px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center gap-2 font-medium'
            >
              Start New Conversation
              <ArrowRight className='w-4 h-4 transform transition-transform group-hover:translate-x-1' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreContainer;
