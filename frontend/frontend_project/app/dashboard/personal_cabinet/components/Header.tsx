'use client';

interface UserData {
  name: string;
  email: string;
  avatar: string | null;
}

interface HeaderProps {
  userData: UserData;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

export default function Header({ userData, onViewProfile, onEditProfile, onLogout }: HeaderProps) {
  return (
    <div className="header-content flex justify-between items-center flex-wrap bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="user-info flex items-center space-x-3">
        <div className="relative">
          {userData.avatar ? (
            <img 
              src={userData.avatar} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <i className="fas fa-user text-white text-xl"></i>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
                              <div>
                        <h2 className="text-lg font-semibold text-black" style={{color: '#000000'}}>{userData.name}</h2>
                        <p className="text-sm text-black" style={{color: '#000000'}}>{userData.email}</p>
                      </div>
      </div>
      
      <div className="auth-buttons flex space-x-2">
        <button 
          onClick={onViewProfile} 
          className="button_secondary flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50"
        >
          <i className="fas fa-user mr-2"></i>
          Профиль
        </button>
        <button 
          onClick={onEditProfile} 
          className="button_secondary flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-green-50"
        >
          <i className="fas fa-edit mr-2"></i>
          Редактировать
        </button>
        <button 
          onClick={onLogout} 
          className="button_warning flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-50"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Выйти
        </button>
      </div>
    </div>
  );
}

