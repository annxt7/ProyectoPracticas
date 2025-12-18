import React, { useState } from "react";
import Logo from "../assets/LogoClaro.png";
import {
  Heart,
  UserPlus,
  MessageSquare,
  Star,
  Zap,
  Home,
  Search,
  User,
} from "lucide-react";
import NavMobile from "../components/NavMobile";  
import NavDesktop from "../components/NavDesktop";

const Activity = () => {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "like_collection",
      user: { name: "Ana_Design", avatar: "https://i.pravatar.cc/150?u=1" },
      content: "le gustó tu colección",
      target: "Minimalist Workspaces",
      image:
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=200",
      time: "2min",
      read: false,
    },
    {
      id: 2,
      type: "follow",
      user: { name: "Julian.Arch", avatar: "https://i.pravatar.cc/150?u=2" },
      content: "empezó a seguirte",
      time: "1h",
      read: false,
      isFollowing: false,
    },
    {
      id: 3,
      type: "comment",
      user: { name: "Luisa_V", avatar: "https://i.pravatar.cc/150?u=3" },
      content: "comentó en",
      target: "Sci-Fi Classics",
      commentSnippet: '"¡Increíble selección! Blade Runner es top."',
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=200",
      time: "5h",
      read: true,
    },
    {
      id: 4,
      type: "system",
      content: "Bienvenido al Early Access de Tribe.",
      time: "1d",
      read: true,
    },
    {
      id: 5,
      type: "like_item",
      user: { name: "Dave_Grohl", avatar: "https://i.pravatar.cc/150?u=4" },
      content: "le gustó un elemento en",
      target: "Vinilos 70s",
      image:
        "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200",
      time: "2d",
      read: true,
    },
  ];

  return (
    <>
      <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content">
        <NavDesktop/>
        <div className="mx-auto px-2 sm:px-4 py-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-3 pl-2">
              Hoy
            </h3>
            <div className="flex flex-col gap-1">
              {notifications
                .filter((n) => !n.read)
                .map((notif) => (
                  <NotificationItem key={notif.id} data={notif} />
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-3 pl-2">
              Esta semana
            </h3>
            <div className="flex flex-col gap-1">
              {notifications
                .filter((n) => n.read)
                .map((notif) => (
                  <NotificationItem key={notif.id} data={notif} />
                ))}
            </div>
          </div>
        </div>
        <NavMobile />
      </div>
    </>
  );
};

const NotificationItem = ({ data }) => {
  return (
    <div
      className={`
      relative group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border-b border-white
      ${data.read ? "hover:bg-base-200/50" : "bg-base-200/30 hover:bg-base-200"}
    `}
    >
      {!data.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"></div>
      )}

      <div className="relative flex-none">
        {data.type === "system" ? (
          <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
            <Zap size={20} />
          </div>
        ) : (
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-base-100 ring-offset-2">
              <img src={data.user.avatar} alt={data.user.name} />
            </div>
            <div
              className={`
              absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-base-100 text-white text-[10px]
              ${
                data.type.includes("like")
                  ? "bg-pink-500"
                  : data.type === "follow"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }
            `}
            >
              {data.type.includes("like") && (
                <Heart size={10} fill="currentColor" />
              )}
              {data.type === "follow" && <UserPlus size={10} />}
              {data.type === "comment" && <MessageSquare size={10} />}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {data.type === "system" ? (
          <p className="text-sm font-medium">{data.content}</p>
        ) : (
          <p className="text-sm leading-snug">
            <span className="font-bold cursor-pointer hover:text-primary">
              {data.user.name}
            </span>{" "}
            <span className="opacity-80">{data.content}</span>{" "}
            {data.target && (
              <span className="font-medium">"{data.target}"</span>
            )}
            {data.commentSnippet && (
              <span className="block mt-1 text-xs opacity-60 pl-2 border-l-2 border-base-300 italic">
                {data.commentSnippet}
              </span>
            )}
          </p>
        )}
        <span className="text-xs opacity-40 mt-1 block">{data.time}</span>
      </div>

      <div className="flex-none">
        {data.type === "follow" && (
          <button className="btn btn-sm btn-outline rounded-full px-4 hover:btn-primary">
            Seguir
          </button>
        )}

        {(data.type.includes("like") || data.type === "comment") &&
          data.image && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-base-300">
              <img
                src={data.image}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default Activity;
