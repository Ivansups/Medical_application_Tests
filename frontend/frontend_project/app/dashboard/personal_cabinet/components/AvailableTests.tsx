'use client';

interface Test {
  id: number;
  title: string;
  description: string;
  questions: number;
  time: string;
  difficulty: string;
  category: string;
}

interface AvailableTestsProps {
  tests: Test[];
  onStartTest: (testId: number) => void;
  isLoading: boolean;
}

export default function AvailableTests({ tests, onStartTest, isLoading }: AvailableTestsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Легкий':
        return 'bg-green-100 text-green-800';
      case 'Средний':
        return 'bg-yellow-100 text-yellow-800';
      case 'Сложный':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800'
    ];
    return colors[Math.abs(category.length) % colors.length];
  };

  return (
    <div className="dashboard-card mb-8">
      <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-black" style={{color: '#000000'}}>Доступные тесты</h2>
        <div className="flex space-x-2">
          <button className="button_secondary px-4 py-2 rounded-lg">
            <i className="fas fa-filter mr-2"></i>
            Фильтр
          </button>
          <button className="button_secondary px-4 py-2 rounded-lg">
            <i className="fas fa-search mr-2"></i>
            Поиск
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div 
            key={test.id} 
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                                 <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2" style={{color: '#000000'}}>{test.title}</h3>
                 <p className="text-black text-sm mb-3 line-clamp-2" style={{color: '#000000'}}>{test.description}</p>
              </div>
              <div className="ml-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
                             <div className="flex justify-between items-center text-sm text-black">
                 <span><i className="fas fa-question-circle mr-1"></i>{test.questions} вопросов</span>
                 <span><i className="fas fa-clock mr-1"></i>{test.time}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(test.category)}`}>
                   {test.category}
                 </span>
                 <div className="flex items-center text-sm text-black">
                   <i className="fas fa-users mr-1"></i>
                   <span>1.2k прошли</span>
                 </div>
               </div>
            </div>
            
            <button 
              onClick={() => onStartTest(test.id)}
              disabled={isLoading}
              className="button_primary w-full flex items-center justify-center py-3 rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Загрузка...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Начать тест
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

