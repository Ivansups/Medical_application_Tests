'use client';

interface Result {
  id: number;
  test: string;
  score: number;
  date: string;
  status: string;
  timeSpent: string;
}

interface RecentResultsProps {
  results: Result[];
  onViewAllResults: () => void;
}

export default function RecentResults({ results, onViewAllResults }: RecentResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return 'fas fa-star text-yellow-500';
    if (score >= 80) return 'fas fa-thumbs-up text-blue-500';
    if (score >= 70) return 'fas fa-check text-green-500';
    return 'fas fa-exclamation-triangle text-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard-card mb-8">
      <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-black" style={{color: '#000000'}}>Последние результаты</h2>
        <button 
          onClick={onViewAllResults} 
          className="button_secondary flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50"
        >
          <i className="fas fa-chart-bar mr-2"></i>
          Все результаты
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="dashboard-table w-full">
          <thead>
            <tr className="bg-gray-50">
                             <th className="text-left py-3 px-4 font-semibold text-black">Тест</th>
               <th className="text-center py-3 px-4 font-semibold text-black">Балл</th>
               <th className="text-center py-3 px-4 font-semibold text-black">Время</th>
               <th className="text-center py-3 px-4 font-semibold text-black">Дата</th>
               <th className="text-center py-3 px-4 font-semibold text-black">Статус</th>
               <th className="text-center py-3 px-4 font-semibold text-black">Действия</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-file-alt text-blue-600"></i>
                    </div>
                    <div>
                      <div className="font-medium text-black">{result.test}</div>
                                             <div className="text-sm text-black">ID: {result.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <i className={getScoreIcon(result.score)}></i>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </span>
                  </div>
                </td>
                                 <td className="py-4 px-4 text-center text-black">
                   <div className="flex items-center justify-center">
                     <i className="fas fa-clock mr-1 text-gray-400"></i>
                     {result.timeSpent}
                   </div>
                 </td>
                 <td className="py-4 px-4 text-center text-black">
                   {formatDate(result.date)}
                 </td>
                <td className="py-4 px-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {result.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200">
                      <i className="fas fa-redo"></i>
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                      <i className="fas fa-share"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
             {results.length === 0 && (
         <div className="text-center py-8">
           <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
           <p className="text-black">Пока нет результатов тестов</p>
           <p className="text-sm text-black">Пройдите свой первый тест, чтобы увидеть результаты здесь</p>
         </div>
       )}
    </div>
  );
}

