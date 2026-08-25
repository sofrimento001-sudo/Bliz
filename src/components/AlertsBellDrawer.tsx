import React from 'react';
import { 
  X, 
  ShieldAlert, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Truck, 
  UserCheck, 
  FileText, 
  CheckCircle2,
  Package,
  Layers
} from 'lucide-react';
import { BlitzInspection } from '../types/blitz';

interface AlertsBellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blitzesWithAlert: BlitzInspection[];
  onSelectBlitz: (blitz: BlitzInspection) => void;
}

export const AlertsBellDrawer: React.FC<AlertsBellDrawerProps> = ({
  isOpen,
  onClose,
  blitzesWithAlert,
  onSelectBlitz,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Click outside to close backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div 
        id="alerts-bell-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-slideLeft"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/90 border border-rose-500/40 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Central de Alertas & Inconformidades
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Meta Corporativa: &ge; 95.0% de Aderência (Erro &le; 5.0%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs text-rose-900">
          <span className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {blitzesWithAlert.length} {blitzesWithAlert.length === 1 ? 'Carga Fora da Meta' : 'Cargas Fora da Meta'}
          </span>
          <span className="text-[11px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full font-bold">
            Ação Imediata
          </span>
        </div>

        {/* Drawer Body List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {blitzesWithAlert.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Nenhum Alerta Ativo</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Todos os carregamentos inspecionados estão operando com aderência superior a 95.0%.
                </p>
              </div>
            </div>
          ) : (
            blitzesWithAlert.map((blitz) => {
              const divergentItems = blitz.items.filter(it => it.status === 'INCONFORME' || it.difference !== 0);

              return (
                <div
                  key={blitz.id}
                  className="bg-white rounded-xl p-4 border border-rose-200 shadow-xs hover:border-rose-300 transition-all space-y-3"
                >
                  {/* Top line: Plate + Route + Adherence */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          {blitz.vehiclePlate}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {blitz.mapNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {blitz.route}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-rose-600 font-bold uppercase block">
                        Aderência:
                      </span>
                      <span className="text-sm font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {blitz.adherencePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Driver & Inspector info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Motorista:</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {blitz.driverName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Conferente:</span>
                      <span className="font-semibold text-slate-700 block">
                        {blitz.inspectorName}
                      </span>
                    </div>
                  </div>

                  {/* Summary of divergent items & reasons */}
                  {divergentItems.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Divergências Identificadas ({blitz.totalErrors} volumes):
                      </span>
                      <div className="space-y-1">
                        {divergentItems.slice(0, 3).map((item, itIdx) => (
                          <div key={itIdx} className="text-[11px] bg-rose-50/70 text-rose-900 p-2 rounded border border-rose-100 flex flex-col gap-0.5">
                            <div className="flex items-center justify-between font-semibold">
                              <span>{item.description}</span>
                              <span className="font-mono font-bold">
                                {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                              </span>
                            </div>
                            {item.notes && (
                              <span className="text-[10px] text-slate-600 italic">
                                Motivo: {item.notes}
                              </span>
                            )}
                          </div>
                        ))}
                        {divergentItems.length > 3 && (
                          <span className="text-[10px] text-slate-400 block text-right">
                            + {divergentItems.length - 3} outras divergências
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  <button
                    onClick={() => {
                      onSelectBlitz(blitz);
                      onClose();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Abrir Triagem & Regularizar Carga</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          Rotina 03.02.36.02 &bull; Amostragem Diária de 2 Veículos
        </div>
      </div>
    </div>
  );
};
