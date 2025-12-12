import React from 'react';  

const MiniUserCard = ({ i }) =>{
return(<>
<div key={i} className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="avatar">
      <div className="w-9 h-9 rounded-full">
        <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="sug" />
      </div>
    </div>
    <div className="text-sm">
      <p className="font-bold">vintage_fan</p>
      <p className="text-xs opacity-60">Nuevo en Tribe</p>
    </div>
  </div>
  <button className="text-primary text-xs font-bold hover:underline">
    Seguir
  </button>
</div>
</>)
}
export default MiniUserCard;
