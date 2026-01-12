import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const FollowsModal = ({ isOpen, onClose, userId, type, title }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/users/${userId}/${type}`);
          setUsers(res.data || []);
        } catch (error) {
          console.error("Error cargando usuarios:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-base-200 flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((u) => (
                <div 
                  key={u.id} 
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${u.id}`);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`} alt={u.username} />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.username}</p>
                      <p className="text-xs opacity-50">{u.bio?.substring(0, 40)}...</p>
                    </div>
                  </div>
                  <button className="btn btn-xs btn-outline rounded-full opacity-0 group-hover:opacity-100 transition-all">Ver</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 opacity-50">
              <p>No hay usuarios aquí todavía.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowsModal;