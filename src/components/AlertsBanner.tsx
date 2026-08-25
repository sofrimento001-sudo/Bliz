import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { BlitzInspection } from '../types/blitz';

interface AlertsBannerProps {
  blitzesWithAlert: BlitzInspection[];
  overallErrorRate: number;
  onSelectBlitz: (blitz: BlitzInspection) => void;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  blitzesWithAlert,
  overallErrorRate,
  onSelectBlitz
}) => {
  const isGlobalAlert = overallErrorRate > 3.0;

  if (blitzesWithAlert.length === 0 && !isGlobalAlert) {
    return null;
  }

  return (
    <div id="alerts-banner-container" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-rose-900 flex items-center gap-2">
                <span>Alerta Automático de Inconformidade de Carregamento</span>
                <span className="bg-rose-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  Meta Corporativa: &ge; 97.0% Aderência
                </span>
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Foram identificados carregamentos com taxa de inconformidade acima de 3.0% (aderência abaixo de 97.0%). Ações corretivas imediatas são requeridas antes da liberação do caminhão na portaria.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-rose-200/80 rounded-md text-rose-900">
                {blitzesWithAlert.length} {blitzesWithAlert.length === 1 ? 'Carga Fora da Meta' : 'Cargas Fora da Meta'}
              </span>
            </div>
          </div>

          {/* List of critical blitzes */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {blitzesWithAlert.slice(0, 4).map((blitz) => (
              <div 
                key={blitz.id}
                onClick={() => onSelectBlitz(blitz)}
                className="bg-white rounded-lg p-2.5 border border-rose-200 hover:border-rose-400 cursor-pointer transition-all shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">
                      {blitz.vehiclePlate}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {blitz.mapNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {blitz.driverCode ? `${blitz.driverCode} - ` : ''}{blitz.driverName} &bull; Conf: {blitz.inspectorName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-rose-600">
                    {blitz.adherencePercentage.toFixed(1)}% adr
                  </div>
                  <span className="text-[10px] text-rose-500 flex items-center justify-end gap-0.5">
                    Revisar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
