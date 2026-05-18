/**
 * ZRL Unified Operations Model - SINGLE SOURCE OF TRUTH per la UI
 */

import type { ZRLOperation, OperationInsight, OperationContract } from "@zrl-contract";
import { pipelineOrchestrator } from "./zrlPipelineOrchestrator";

class ZRLUnifiedOperationsModel {
  private activeOperationId: string | null = null;

  private getContract(status: string): OperationContract {
    const base = { requiredState: status, autoExecutable: false };
    switch (status) {
      case 'IDLE':
        return { ...base, allowedActions: ['START'], forbiddenActions: ['PAUSE', 'RESUME', 'CANCEL'], autoExecutable: true };
      
      case 'SEASON_INITIALIZING':
      case 'ROUND_INITIALIZING':
      case 'ROUND_ARCHIVING':
        return { ...base, allowedActions: ['PAUSE', 'CANCEL'], forbiddenActions: ['START', 'RESUME'] };
      
      case 'PAUSED':
        return { ...base, allowedActions: ['RESUME', 'CANCEL'], forbiddenActions: ['START', 'PAUSE'] };
      
      case 'FAILED':
      case 'CANCELLED':
      case 'COMPLETED':
        return { ...base, allowedActions: ['START'], forbiddenActions: ['PAUSE', 'RESUME', 'CANCEL'] };
        
      default:
        return { ...base, allowedActions: ['START'], forbiddenActions: [], reasonForBlocking: 'Stato non gestito' };
    }
  }

  private calculateInsight(status: string): OperationInsight {
    switch (status) {
      case 'IDLE':
        return { 
            nextBestAction: 'Start Initialization', 
            reason: 'Sistema pronto.',
            triggerEvent: 'System Init',
            currentState: 'IDLE',
            riskIfIgnored: 'Nessuna operazione in corso.',
            riskLevel: 'low', 
            recommendation: 'Avvia la pipeline per la stagione 2026.' 
        };
      case 'PAUSED':
        return { 
            nextBestAction: 'Resume Pipeline', 
            reason: 'Esecuzione sospesa manualmente.',
            triggerEvent: 'User Suspend',
            currentState: 'PAUSED',
            riskIfIgnored: 'Il completamento dei round rimarrà bloccato.',
            riskLevel: 'medium', 
            recommendation: 'Riprendi l\'esecuzione o cancella l\'operazione.' 
        };
      case 'CANCELLED':
        return { 
            nextBestAction: 'Restart Pipeline', 
            reason: 'Operazione annullata dall\'amministratore.',
            triggerEvent: 'User Cancel',
            currentState: 'CANCELLED',
            riskIfIgnored: 'La stagione non verrà inizializzata.',
            riskLevel: 'medium', 
            recommendation: 'Esegui START per ricominciare da zero.' 
        };
      case 'COMPLETED':
        return { 
            nextBestAction: 'Archive or Restart', 
            reason: 'Pipeline completata con successo.',
            triggerEvent: 'Success',
            currentState: 'COMPLETED',
            riskIfIgnored: 'Dati non archiviati.',
            riskLevel: 'low', 
            recommendation: 'L\'operazione è terminata. Puoi riavviarla se necessario.' 
        };
      case 'SEASON_INITIALIZING':
      case 'ROUND_INITIALIZING':
      case 'ROUND_ARCHIVING':
        return { 
            nextBestAction: 'Monitor Execution', 
            reason: 'Pipeline attiva.',
            triggerEvent: 'Pipeline Active',
            currentState: status,
            riskIfIgnored: 'Possibile perdita di visibilità sul progresso.',
            riskLevel: 'medium', 
            recommendation: 'Controlla la timeline per eventi in tempo reale.' 
        };
      default:
        return { 
            nextBestAction: 'Check Logs', 
            reason: 'Stato non standard.',
            triggerEvent: 'Unknown',
            currentState: status,
            riskIfIgnored: 'Instabilità.',
            riskLevel: 'medium', 
            recommendation: 'Verifica lo stato dello store.' 
        };
    }
  }

  getActiveOperation(): ZRLOperation | null {
    const all = this.getOperationsList();
    if (all.length === 0) return null;
    if (!this.activeOperationId) this.activeOperationId = all[0].instanceId;
    
    const instance = pipelineOrchestrator.getInstance(this.activeOperationId);
    if (!instance) return null;

    const status = instance.store.getState().status;
    return {
      id: instance.id,
      seasonId: `season_${instance.seasonYear}`,
      instanceId: instance.id,
      versionId: 1,
      status: status,
      timeline: instance.telemetry.getAuditHistory(),
      insight: this.calculateInsight(status),
      contract: this.getContract(status)
    };
  }

  switchOperation(instanceId: string) {
    this.activeOperationId = instanceId;
  }

  getOperationsList(): ZRLOperation[] {
    return pipelineOrchestrator.getAllInstances().map(inst => {
      const status = inst.store.getState().status;
      return {
        id: inst.id,
        seasonId: `season_${inst.seasonYear}`,
        instanceId: inst.id,
        versionId: 1,
        status: status,
        timeline: [...inst.telemetry.getAuditHistory()],
        insight: { ...this.calculateInsight(status) },
        contract: { ...this.getContract(status) }
      };
    });
  }
}

export const unifiedOps = new ZRLUnifiedOperationsModel();
