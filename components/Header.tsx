import { User } from '../types';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, user }) => {
  return (
    <header className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 lg:px-12 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden size-10 flex items-center justify-center bg-white rounded-xl text-text-main shadow-soft border border-blue-50"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-xl md:text-3xl font-bold text-text-main tracking-tight truncate max-w-[150px] md:max-w-none">
          {title === 'DASHBOARD' ? 'HOME' : title}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center bg-white rounded-full h-12 px-5 w-80 shadow-soft border border-blue-50 transition-all focus-within:shadow-md focus-within:border-blue-100">
          <span className="material-symbols-outlined text-text-tertiary text-[20px]">search</span>
          <input
            className="bg-transparent border-none text-sm w-full focus:ring-0 text-text-main placeholder-text-tertiary ml-2 font-medium"
            placeholder="Search anything..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="size-11 flex items-center justify-center bg-white rounded-full text-text-main hover:text-primary shadow-soft relative transition-colors border border-blue-50">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-3 right-3 size-1.5 bg-accent-red rounded-full ring-2 ring-white"></span>
          </button>

          <div className="size-11 rounded-full bg-cover bg-center border-2 border-white shadow-soft cursor-pointer hover:border-blue-100 transition-colors" style={{ backgroundImage: `url(${user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d33f2&color=fff`})` }}></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
