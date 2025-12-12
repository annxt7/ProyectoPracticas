import React from 'react';
import { User, Users, Bell, Menu } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-100 sticky top-0 z-50 border-b border-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl font-serif">Feed</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-16 hidden sm:flex flex-col items-center py-4 gap-6 border-r border-base-200 h-[calc(100vh-64px)]">
          <button className="btn btn-circle btn-primary btn-sm"><User size={18} /></button>
          <button className="btn btn-circle btn-ghost btn-sm"><Users size={18} /></button>
          <button className="btn btn-circle btn-ghost btn-sm"><Bell size={18} /></button>
        </div>

        {/* Lista de Actividad */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="alert bg-base-200/50 shadow-sm border-none rounded-box flex items-center justify-start gap-4">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              </div>
              <div className="flex-1 text-sm">
                <span className="font-bold">usuario39</span> ha añadido <span className="italic font-medium">Star Wars</span> a su colección <span className="badge badge-outline badge-sm ml-1">Movies</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;