import { Zap, Trophy, MessageSquare, Share2, Send, Activity, Settings } from 'lucide-react';

export interface AiFeature {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: any;
  status: 'active' | 'admin' | 'experimental';
  type: 'page' | 'modal' | 'action';
  permission: string;
}

export const AI_FEATURE_REGISTRY: AiFeature[] = [
  {
    id: 'race-reports',
    title: 'Race Intelligence',
    description: 'Generazione e analisi narrativa delle gare singole.',
    path: '/ai/narrative',
    icon: Zap,
    status: 'active',
    type: 'page',
    permission: 'zrl.view'
  },
  {
    id: 'season-intelligence',
    title: 'Season Review',
    description: 'Analisi profonda della stagione e trend competitivi.',
    path: '/ai/narrative',
    icon: Trophy,
    status: 'active',
    type: 'page',
    permission: 'zrl.view'
  },
  {
    id: 'narrative-engine',
    title: 'Narrative Insights',
    description: 'Analisi MVP, momenti chiave e rivalità.',
    path: '/ai/narrative',
    icon: MessageSquare,
    status: 'active',
    type: 'modal',
    permission: 'zrl.view'
  },
  {
    id: 'social-studio',
    title: 'Social Studio',
    description: 'Distribuzione automatica su Discord e Webhook.',
    path: '/admin/ai-social',
    icon: Share2,
    status: 'active',
    type: 'modal',
    permission: 'admin.ai'
  },
  {
    id: 'publish-queue',
    title: 'Publish Queue',
    description: 'Monitoraggio code di pubblicazione asincrona.',
    path: '/admin/ai-queue',
    icon: Send,
    status: 'admin',
    type: 'page',
    permission: 'admin.ai'
  },
  {
    id: 'system-health',
    title: 'AI System Health',
    description: 'Monitoraggio costi, token e latenza AI.',
    path: '/admin/ai-health',
    icon: Activity,
    status: 'admin',
    type: 'page',
    permission: 'admin.ai'
  }
];
