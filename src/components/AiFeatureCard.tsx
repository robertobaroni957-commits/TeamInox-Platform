import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiFeature } from '../../services/aiFeatureRegistry';
import { ChevronRight } from 'lucide-react';

interface AiFeatureCardProps {
  feature: AiFeature;
  isAdmin: boolean;
}

export const AiFeatureCard: React.FC<AiFeatureCardProps> = ({ feature, isAdmin }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (feature.type === 'page') {
      navigate(feature.path);
    } else {
      console.log(`Action: ${feature.id} not fully implemented as modal yet`);
    }
  };

  if (feature.status === 'admin' && !isAdmin) return null;

  return (
    <div 
      onClick={handleClick}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 transition-all cursor-pointer group shadow-xl"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-orange-500/20 transition-colors">
          <feature.icon className="text-orange-500" size={24} />
        </div>
        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          feature.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'
        }`}>
          {feature.status}
        </span>
      </div>
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">{feature.title}</h3>
      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">{feature.description}</p>
      <div className="flex items-center text-orange-500 text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
        Apri modulo <ChevronRight size={14} />
      </div>
    </div>
  );
};
