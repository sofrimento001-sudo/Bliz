import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  UserCheck, 
  Truck, 
  ShieldCheck, 
  Target,
  BarChart2,
  Calendar,
  Percent,
  SearchCheck
} from 'lucide-react';
import { BlitzInspection, MonthlyStats, Vehicle } from '../types/blitz';
import { StorageService } from '../services/storageService';
import { TOTAL_EXPEDITED_VEHICLES } from '../data/initialData';

interface DashboardAnalyticsProps {
  blitzes: BlitzInspection[];
  vehicles: Vehicle[];
  monthlyStats: MonthlyStats[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  blitzes,
  vehicles,
  monthlyStats,
  selectedMonth,
  setSelectedMonth,
}) => {
  // Global KPIs calculations
  const totalBlitzes = blitzes.length;
  const totalItemsExpected = blitzes.reduce((acc, b) => acc + (b.totalItemsExpected || 0), 0);
  const totalItemsInspected = blitzes.reduce((acc, b) => acc + (b.totalItemsInspected || 0), 0);
  const totalErrors = blitzes.reduce((acc, b) => acc + (b.totalErrors || 0), 0);
  
  const divisor = totalItemsInspected > 0 ? totalItemsInspected : (totalItemsExpected > 0 ? totalItemsExpected : 1);
  const globalErrorRate = divisor > 0 ? Number(((totalErrors / divisor) * 100).toFixed(2)) : 0;
  const globalAdherenceRate = Number(Math.max(0, 100 - globalErrorRate).toFixed(2));
  const totalAlerts = blitzes.filter(b => b.isAboveErrorThreshold).length;

  // Stats by Vehicle Plate (16 plates)
  const plateStats = useMemo(() => {
    return vehicles.map(vehicle => {
      const vehicleBlitzes = blitzes.filter(b => b.vehiclePlate === vehicle.plate);
      const totalExp = vehicleBlitzes.reduce((sum, b) => sum + (b.totalItemsExpected || 0), 0);
      const totalInsp = vehicleBlitzes.reduce((sum, b) => sum + (b.totalItemsInspected || 0), 0);
      const totalErr = vehicleBlitzes.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
      const div = totalInsp > 0 ? totalInsp : (totalExp > 0 ? totalExp : 1);
      const errorRate = div > 0 ? Number(((totalErr / div) * 100).toFixed(2)) : 0;
      const adherenceRate = Math.max(0, 100 - errorRate);

      return {
        plate: vehicle.plate,
        palletCapacity: vehicle.palletCapacity,
        driverCode: vehicle.driverCode || '',
        driverName: vehicle.driverName || 'Motorista',
        blitzCount: vehicleBlitzes.length,
        totalItems: totalExp,
        errorRate: errorRate,
        adherenceRate: adherenceRate,
        isAlert: errorRate > 5.0 || adherenceRate < 95.0,
      };
    }).sort((a, b) => b.errorRate - a.errorRate);
  }, [blitzes, vehicles]);

  // Stats by Inspector: Percentual de Carros Conferidos e Percentual com Divergências Encontradas
  const inspectorStats = useMemo(() => {
    return StorageService.getInspectorPerformance(blitzes);
  }, [blitzes]);

  // Non-Conformities Breakdown (Reasons of Error)
  const nonConformityBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      'Falta de Quantidade': 0,
      'Avaria Física': 0,
      'SKU Invertido / Troca': 0,
      'Sobra / Excesso': 0,
      'Lote / Validade': 0,
      'Embalagem Violada': 0,
    };

    blitzes.forEach(b => {
      b.items.forEach(item => {
        if (item.status === 'INCONFORME') {
          if (item.nonConformityType === 'QUANTIDADE_FALTA') map['Falta de Quantidade'] += Math.abs(item.difference) || 1;
          else if (item.nonConformityType === 'AVARIA_FISICA') map['Avaria Física'] += 1;
          else if (item.nonConformityType === 'SKU_INVERTIDO') map['SKU Invertido / Troca'] += Math.abs(item.difference) || 1;
          else if (item.nonConformityType === 'QUANTIDADE_EXCESSO') map['Sobra / Excesso'] += Math.abs(item.difference) || 1;
          else if (item.nonConformityType === 'LOTE_INVALIDO') map['Lote / Validade'] += 1;
          else if (item.nonConformityType === 'EMBALAGEM_VIOLADA') map['Embalagem Violada'] += 1;
        }
      });
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [blitzes]);

  return (
    <div id="dashboard-analytics-container" className="space-y-6">
      
      {/* Top Header & Month Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" />
            <span>Dashboard Total Acumulado &bull; Meta &ge; 95.0%</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Universo de <strong>{TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')} carros</strong> expedidos &bull; Amostragem de <strong>2 carros por dia útil</strong> (Seg-Sex, exceto feriados).
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Mês de Referência:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Todo o Histórico (Acumulado)</option>
            <option value="2026-08">Agosto / 2026 (Atual)</option>
            <option value="2026-07">Julho / 2026</option>
            <option value="2026-06">Junho / 2026</option>
            <option value="2026-05">Maio / 2026</option>
            <option value="2026-04">Abril / 2026</option>
            <option value="2026-03">Março / 2026</option>
            <option value="2026-02">Fevereiro / 2026</option>
            <option value="2026-01">Janeiro / 2026</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 0: Universo Operacional */}
        <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Frota Total Expedida</span>
            <div className="p-1.5 rounded-lg bg-blue-900/70 text-blue-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')}</span>
            <span className="text-xs text-slate-400 font-medium">carros</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            2 sorteios / dia útil (Seg a Sex)
          </p>
        </div>

        {/* KPI 1: Blitzes Executadas */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blitzes Auditadas</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <SearchCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{totalBlitzes}</span>
            <span className="text-xs text-slate-500 font-medium">inspeções</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {totalItemsExpected.toLocaleString('pt-BR')} volumes conferidos
          </p>
        </div>

        {/* KPI 2: Aderência Global de Carregamento (Meta >= 95%) */}
        <div className={`rounded-xl border p-4 shadow-sm ${
          globalAdherenceRate < 95.0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aderência Global</span>
            <div className={`p-1.5 rounded-lg ${globalAdherenceRate >= 95.0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-100 text-rose-700'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${globalAdherenceRate >= 95.0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {globalAdherenceRate.toFixed(2)}%
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              Meta: &ge;95%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {globalAdherenceRate >= 95.0 ? '✓ Dentro da meta corporativa' : '⚠ Abaixo do target (95%)'}
          </p>
        </div>

        {/* KPI 3: Taxa de Dispersão (Erro <= 5%) */}
        <div className={`rounded-xl border p-4 shadow-sm ${
          globalErrorRate > 5.0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taxa de Dispersão</span>
            <div className={`p-1.5 rounded-lg ${globalErrorRate > 5.0 ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-600'}`}>
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${globalErrorRate > 5.0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {globalErrorRate.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium">(Meta: &le;5%)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {totalErrors.toLocaleString('pt-BR')} itens com divergência
          </p>
        </div>

        {/* KPI 4: Alertas Críticos */}
        <div className={`rounded-xl border p-4 shadow-sm ${
          totalAlerts > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alertas Emitidos</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">{totalAlerts}</span>
            <span className="text-xs text-rose-700 font-medium">cargas &lt; 95%</span>
          </div>
          <p className="text-[10px] text-rose-700 mt-1">
            Inconformidades registradas
          </p>
        </div>

      </div>

      {/* Main Chart: Real Adherence (%) & Error Rate (%) vs Corporate Target Line (95.0% / 5.0%) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Evolução Mensal da Aderência vs Meta Corporativa (≥ 95.0%)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Monitoramento histórico com linha de conformidade de 95% (Dispersão máxima &le; 5%).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="font-semibold text-slate-700">Aderência Real (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-700 border border-dashed border-emerald-700"></span>
              <span className="font-semibold text-emerald-700">Meta Corporativa (≥ 95.0%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyStats} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" domain={[90, 100]} />
              <Tooltip 
                formatter={(value: any, name: any) => [`${value}%`, name === 'adherenceRate' ? 'Aderência Real' : 'Meta Mínima']}
                labelFormatter={(label) => `Período: ${label}`}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <ReferenceLine 
                y={95.0} 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                label={{ value: 'META CORPORATIVA (95.0%)', position: 'insideTopRight', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} 
              />
              <Line 
                type="monotone" 
                dataKey="adherenceRate" 
                name="adherenceRate"
                stroke="#059669" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Indicators per Vehicle Plate (16 plates) & Inspector Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Indicators per Vehicle Plate (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Indicadores por Placa & Motorista Oficial (16 Caminhões)
              </h3>
              <p className="text-xs text-slate-500">
                Dispersão de erros por veículo com indicação de cargas fora da meta de 95%.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              16 Placas Ativas
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plateStats} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="plate" 
                  angle={-45} 
                  textAnchor="end" 
                  stroke="#64748b" 
                  fontSize={10} 
                  interval={0} 
                />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 8]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% de erro (Aderência: ${item.payload.adherenceRate.toFixed(1)}%) - Motorista: ${item.payload.driverCode} ${item.payload.driverName}`, 
                    'Taxa de Erro'
                  ]}
                />
                <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Limite 5%', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="errorRate" radius={[4, 4, 0, 0]}>
                  {plateStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.errorRate > 5.0 ? '#ef4444' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs mt-2 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span> Conforme (&ge; 95% aderência / &le; 5% erro)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span> Alerta de Inconformidade (&lt; 95% aderência / &gt; 5% erro)
            </span>
          </div>
        </div>

        {/* Inspector Comparison (Focado apenas em % de carros conferidos e % com divergências) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Conferentes Diurnos</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Percentual de veículos conferidos e índice de identificação de divergências.
            </p>

            <div className="space-y-4">
              {inspectorStats.map((ins, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{ins.name}</span>
                      <span className="text-[11px] text-blue-700 font-semibold">
                        Conferiu {ins.percentageOfTotalCars}% dos carros ({ins.totalBlitzesAudited} veículos)
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      ins.averageAdherenceRate >= 95.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ins.averageAdherenceRate.toFixed(2)}% aderência
                    </span>
                  </div>

                  {/* Operational metrics requested by user */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/70 text-xs">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Carros c/ Divergência:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-extrabold text-rose-600 text-sm">{ins.errorEncounterRate}%</span>
                        <span className="text-[10px] text-slate-500">({ins.totalBlitzesWithErrors} carros)</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Taxa Média de Erro:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-extrabold text-slate-900 text-sm">{ins.averageErrorRate.toFixed(2)}%</span>
                        <span className="text-[10px] text-slate-400">(Meta &le;5%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Causes Breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Principais Tipos de Inconformidade
            </span>
            <div className="space-y-1.5 text-xs">
              {nonConformityBreakdown.slice(0, 4).map((nc, nIdx) => (
                <div key={nIdx} className="flex items-center justify-between text-slate-600">
                  <span className="truncate">{nc.name}</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {nc.value} un
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
