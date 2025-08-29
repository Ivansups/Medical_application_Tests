'use client';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
}

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-6">
        <div>
                     <h2 className="text-2xl font-bold text-black" style={{color: '#000000'}}>Достижения</h2>
           <p className="text-black text-sm" style={{color: '#000000'}}>
             Разблокировано {unlockedCount} из {totalCount} достижений
           </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{unlockedCount}</span>
          </div>
                      <div className="text-right">
              <div className="text-sm text-black">Прогресс</div>
              <div className="text-lg font-bold text-black">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
              achievement.unlocked 
                ? 'bg-white border-green-200 shadow-md hover:shadow-lg' 
                : 'bg-gray-50 border-gray-200 opacity-75'
            }`}
          >
            {/* Индикатор разблокировки */}
            {achievement.unlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-xs"></i>
              </div>
            )}
            
            {/* Иконка достижения */}
            <div className="text-center mb-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                achievement.unlocked ? achievement.color : 'bg-gray-200 text-gray-400'
              }`}>
                <i className={`${achievement.icon} text-2xl`}></i>
              </div>
              
                             <h3 className={`text-lg font-semibold mb-2 ${
                 achievement.unlocked ? 'text-black' : 'text-black'
               }`}>
                 {achievement.title}
               </h3>
               
               <p className={`text-sm mb-4 ${
                 achievement.unlocked ? 'text-black' : 'text-black'
               }`}>
                 {achievement.description}
               </p>
            </div>
            
            {/* Прогресс-бар */}
            <div className="space-y-2">
                             <div className="flex justify-between items-center text-xs">
                 <span className={achievement.unlocked ? 'text-black' : 'text-black'}>
                   Прогресс
                 </span>
                 <span className={achievement.unlocked ? 'text-black font-medium' : 'text-black'}>
                   {achievement.progress}%
                 </span>
               </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gray-300'
                  }`}
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Статус */}
            <div className="mt-4 text-center">
              {achievement.unlocked ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i className="fas fa-trophy mr-1"></i>
                  Разблокировано
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  <i className="fas fa-lock mr-1"></i>
                  Заблокировано
                </span>
              )}
            </div>
            
            {/* Эффект при наведении */}
            {achievement.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Общая статистика достижений */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                 <h3 className="text-lg font-semibold text-black mb-4">Ваши достижения</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{unlockedCount}</div>
             <div className="text-sm text-black">Разблокировано</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-green-600">
               {achievements.filter(a => a.progress === 100).length}
             </div>
             <div className="text-sm text-black">Завершено</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-yellow-600">
               {achievements.filter(a => a.progress > 0 && a.progress < 100).length}
             </div>
             <div className="text-sm text-black">В процессе</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-purple-600">
               {Math.round((unlockedCount / totalCount) * 100)}%
             </div>
             <div className="text-sm text-black">Общий прогресс</div>
           </div>
         </div>
      </div>
    </div>
  );
}

