import React from 'react';
import { 
  Dice5, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  User, 
  MapPin, 
  FileSpreadsheet, 
  Play, 
  RefreshCw, 
  Plus, 
  Sparkles,
  ShieldCheck,
  Percent,
  TrendingDown
} from 'lucide-react';
import { BlitzInspection, DailyDraw, Vehicle } from '../types/blitz';

interface DailyBlitzSectionProps {
  selectedDate: string;
  dailyDraw: DailyDraw | null;
  dailyBlitzes: BlitzInspection[];
  onStartInspection: (blitz: BlitzInspection) => void;
  onRedraw: () => void;
  onAddExtraVehicle: () => void;
  allVehicles: Vehicle[];
}

export const DailyBlitzSection: React.FC<DailyBlitzSectionProps> = ({
  selectedDate,
  dailyDraw,
  dailyBlitzes,
  onStartInspection,
  onRedraw,
  onAddExtraVehicle,
  allVehicles,
}) => {
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const totalExpectedToday = dailyBlitzes.reduce((sum, b) => sum + (b.totalItemsExpected || 0), 0);
  const totalInspectedToday = dailyBlitzes.reduce((sum, b) => sum + (b.totalItemsInspected || 0), 0);
  const totalErrorsToday = dailyBlitzes.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
  const divisor = totalInspectedToday > 0 ? totalInspectedToday : (totalExpectedToday > 0 ? totalExpectedToday : 1);
  const todayErrorRate = divisor > 0 ? (totalErrorsToday / divisor) * 100 : 0;
  const todayAdherenceRate = Math.max(0, 100 - todayErrorRate);
  const isDailyAlert = todayErrorRate > 5.0 || todayAdherenceRate < 95.0;

  return (
    <div id="daily-blitz-section" className="space-y-6">
      
      {/* Header of Daily Draw */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Rotina 03.02.36.02 &bull; Universo 1.854 Veículos &bull; 2 Sorteios / Dia Útil (Seg a Sex)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 capitalize">
              {formattedDate}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Conferente Designado: <span className="font-semibold text-slate-900">{dailyDraw?.inspectorExpected || 'Responsável do Turno'}</span> &bull; 
              Meta Corporativa: <strong className="text-emerald-700 font-bold">&ge; 95% de Aderência</strong> (Dispersão máxima &le; 5%).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRedraw}
              id="btn-redraw"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Realizar novo sorteio aleatório com prioridade aos veículos menos inspecionados"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sortear Novamente (2 Veículos)</span>
            </button>

            <button
              onClick={onAddExtraVehicle}
              id="btn-add-extra"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
              title="Incluir um veículo adicional na blitz de hoje"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Veículo Extra</span>
            </button>
          </div>
        </div>

        {/* Daily Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Veículos Sorteados</span>
            <span className="text-lg font-bold text-slate-900">{dailyBlitzes.length} caminhões</span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Itens / SKUs no Mapa</span>
            <span className="text-lg font-bold text-slate-900">{totalExpectedToday.toLocaleString('pt-BR')} volumes</span>
          </div>

          <div className={`rounded-lg p-3 border ${isDailyAlert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Taxa de Erro do Dia</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-bold ${isDailyAlert ? 'text-rose-600' : 'text-slate-900'}`}>
                {todayErrorRate.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-400 font-normal">(Meta: &le; 5%)</span>
            </div>
          </div>

          <div className={`rounded-lg p-3 border ${todayAdherenceRate >= 95 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Aderência de Carga</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-bold ${todayAdherenceRate >= 95 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {todayAdherenceRate.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-400 font-normal">(Meta: &ge; 95%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards of Drawn Vehicles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Veículos em Blitz Imediata</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {dailyBlitzes.length}
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            Triagem física imediata com registro de divergências (Itens Divergentes x Conferidos)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyBlitzes.map((blitz) => {
            const isCompleted = blitz.status === 'CONCLUIDA';
            const isInProgress = blitz.status === 'EM_ANDAMENTO';
            const isAlert = blitz.isAboveErrorThreshold;

            return (
              <div 
                key={blitz.id}
                id={`card-blitz-${blitz.id}`}
                className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between ${
                  isAlert 
                    ? 'border-rose-300 ring-2 ring-rose-500/20' 
                    : isCompleted 
                      ? 'border-emerald-300' 
                      : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono font-bold shadow-inner">
                        <span className="text-xs text-blue-400">BR</span>
                        <span className="text-xs leading-none">{blitz.vehiclePlate}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            {blitz.vehiclePlate}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium border border-slate-200 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-500" />
                            {blitz.palletCapacity} Pallets
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-slate-700">{blitz.mapNumber}</span>
                          <span>&bull;</span>
                          <span>{blitz.route}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Concluída
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Em Triagem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                          <Clock className="w-3.5 h-3.5" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Motorista Oficial</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {blitz.driverCode ? `${blitz.driverCode} - ` : ''}{blitz.driverName}
                      </span>
                      <span className="text-[11px] text-slate-500">{blitz.carrier}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Doca & Horário</span>
                      <span className="font-semibold text-slate-800 block">
                        {blitz.dockNumber || 'Doca 01'} &bull; {blitz.time}h
                      </span>
                    </div>
                  </div>

                  {/* Results preview if items exist */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Itens Aferidos (~2.900 SKUs):</span>
                      <span className="text-sm font-bold text-slate-800">
                        {blitz.totalItemsInspected.toLocaleString('pt-BR')} / {blitz.totalItemsExpected.toLocaleString('pt-BR')} un
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Aderência vs Meta (&ge; 97%):</span>
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-extrabold ${isAlert ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {blitz.adherencePercentage.toFixed(2)}%
                        </span>
                        {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                    </div>
                  </div>

                  {blitz.observations && (
                    <p className="text-xs text-slate-500 mt-2.5 italic line-clamp-1">
                      "{blitz.observations}"
                    </p>
                  )}
                </div>

                {/* Card Bottom CTA */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Conferente: <span className="font-medium text-slate-700">{blitz.inspectorName}</span>
                  </span>

                  <button
                    onClick={() => onStartInspection(blitz)}
                    id={`btn-inspect-${blitz.id}`}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs ${
                      isCompleted 
                        ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Ver / Editar Triagem' : 'Aferir Carregamento'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
