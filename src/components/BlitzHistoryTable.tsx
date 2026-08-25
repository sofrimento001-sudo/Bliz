import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Layers, 
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
  FileText
} from 'lucide-react';
import { BlitzInspection, FilterState, Vehicle } from '../types/blitz';

interface BlitzHistoryTableProps {
  blitzes: BlitzInspection[];
  vehicles: Vehicle[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onEditBlitz: (blitz: BlitzInspection) => void;
  onDeleteBlitz: (id: string) => void;
}

export const BlitzHistoryTable: React.FC<BlitzHistoryTableProps> = ({
  blitzes,
  vehicles,
  filter,
  setFilter,
  onEditBlitz,
  onDeleteBlitz,
}) => {
  const [expandedBlitzId, setExpandedBlitzId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBlitzId(prev => prev === id ? null : id);
  };

  return (
    <div id="blitz-history-container" className="space-y-4">
      
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa, mapa, motorista (código/nome), rota ou conferente..."
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Clear Filters */}
          {(filter.searchQuery || filter.selectedInspector !== 'ALL' || filter.selectedPlate !== 'ALL' || filter.statusFilter !== 'ALL' || filter.dateFilterType !== 'ALL') && (
            <button
              onClick={() => setFilter({
                searchQuery: '',
                dateFilterType: 'ALL',
                selectedDate: '2026-08-25',
                selectedMonth: '2026-08',
                startDate: '',
                endDate: '',
                selectedInspector: 'ALL',
                selectedPlate: 'ALL',
                statusFilter: 'ALL'
              })}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Detailed Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Date / Period Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Filtrar Período</label>
            <select
              value={filter.dateFilterType}
              onChange={(e) => setFilter(prev => ({ ...prev, dateFilterType: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todo o Histórico</option>
              <option value="TODAY">Dia de Hoje</option>
              <option value="MONTH">Por Mês</option>
              <option value="CUSTOM_DATE">Data Específica</option>
            </select>
          </div>

          {/* Month or Custom Date conditional */}
          {filter.dateFilterType === 'MONTH' ? (
            <div>
              <label className="block text-slate-500 font-medium mb-1">Selecione o Mês</label>
              <input
                type="month"
                value={filter.selectedMonth}
                onChange={(e) => setFilter(prev => ({ ...prev, selectedMonth: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : filter.dateFilterType === 'CUSTOM_DATE' ? (
            <div>
              <label className="block text-slate-500 font-medium mb-1">Selecione o Dia</label>
              <input
                type="date"
                value={filter.selectedDate}
                onChange={(e) => setFilter(prev => ({ ...prev, selectedDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-500 font-medium mb-1">Status da Meta (&ge; 95%)</label>
              <select
                value={filter.statusFilter}
                onChange={(e) => setFilter(prev => ({ ...prev, statusFilter: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="CONFORME">Conforme (&ge; 95% de Aderência)</option>
                <option value="ALERTA">Em Alerta (&lt; 95% de Aderência)</option>
                <option value="PENDENTE">Pendentes / Em Triagem</option>
              </select>
            </div>
          )}

          {/* Inspector Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Conferente Diurno</label>
            <select
              value={filter.selectedInspector}
              onChange={(e) => setFilter(prev => ({ ...prev, selectedInspector: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todos os Conferentes</option>
              <option value="Gilson">Gilson (Desde 14/Abr)</option>
              <option value="Nixon Henrique">Nixon Henrique (Até Abr)</option>
            </select>
          </div>

          {/* Vehicle Plate Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Placa do Veículo</label>
            <select
              value={filter.selectedPlate}
              onChange={(e) => setFilter(prev => ({ ...prev, selectedPlate: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todas as 16 Placas</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.plate}>
                  {v.plate} ({v.palletCapacity}p - {v.driverCode} {v.driverName})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-700">
          Mostrando {blitzes.length} {blitzes.length === 1 ? 'registro de aferição' : 'registros de aferição'}
        </span>
        <span className="text-xs text-slate-500">
          Meta Corporativa: <strong>Aderência &ge; 95.0%</strong> (Erro &le; 5.0%)
        </span>
      </div>

      {/* Blitz Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-3 text-center w-8"></th>
                <th className="py-3 px-3">Data & Horário</th>
                <th className="py-3 px-3">Veículo / Motorista</th>
                <th className="py-3 px-3">Mapa & Rota</th>
                <th className="py-3 px-3">Conferente</th>
                <th className="py-3 px-3 text-center">Itens (~2.900 SKUs)</th>
                <th className="py-3 px-3 text-center">Divergências</th>
                <th className="py-3 px-3 text-center">Taxa de Erro (%)</th>
                <th className="py-3 px-3 text-center">Aderência (%)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {blitzes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                blitzes.map((b) => {
                  const isAlert = b.isAboveErrorThreshold;
                  const isDone = b.status === 'CONCLUIDA';
                  const isExpanded = expandedBlitzId === b.id;
                  const divergentItems = b.items.filter(it => it.status === 'INCONFORME' || it.difference !== 0);

                  return (
                    <React.Fragment key={b.id}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isAlert ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Expand Button */}
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => toggleExpand(b.id)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                            title="Ver itens e divergências detalhadas"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Data & Horário */}
                        <td className="py-3 px-3 font-medium whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{b.date}</div>
                          <div className="text-[11px] text-slate-500">{b.time}h &bull; {b.dockNumber || 'Doca 01'}</div>
                        </td>

                        {/* Placa & Motorista */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                              {b.vehiclePlate}
                            </span>
                            <span className="bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.5 rounded font-medium border border-slate-200 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400" />
                              {b.palletCapacity}p
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-semibold mt-0.5 truncate max-w-[170px]" title={`${b.driverCode} ${b.driverName}`}>
                            {b.driverCode ? `${b.driverCode} - ` : ''}{b.driverName}
                          </div>
                        </td>

                        {/* Mapa & Rota */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{b.mapNumber}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={b.route}>
                            {b.route}
                          </div>
                        </td>

                        {/* Conferente */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">{b.inspectorName}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{b.shift}</span>
                        </td>

                        {/* Itens Auditados */}
                        <td className="py-3 px-3 text-center font-bold">
                          {b.totalItemsInspected.toLocaleString('pt-BR')} / {b.totalItemsExpected.toLocaleString('pt-BR')}
                        </td>

                        {/* Divergências */}
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${
                            b.totalErrors > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.totalErrors} un
                          </span>
                        </td>

                        {/* Taxa de Erro */}
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md font-extrabold text-xs ${
                            isAlert ? 'bg-rose-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {b.errorPercentage.toFixed(2)}%
                          </span>
                        </td>

                        {/* Aderência */}
                        <td className="py-3 px-3 text-center">
                          <span className={`font-extrabold text-xs ${
                            b.adherencePercentage >= 95.0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {b.adherencePercentage.toFixed(2)}%
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Concluída
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Pendente
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditBlitz(b)}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                              title="Editar ou realizar triagem"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteBlitz(b.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="Excluir registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row: Breakdown of Divergent Items & Notes */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={11} className="p-4 space-y-3">
                            <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-blue-600" />
                                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                    Detalhamento de Itens & Motivos de Divergência ({b.items.length} SKUs no Mapa)
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Regra Operacional: 98% de até 4 SKUs &bull; Restante até 15 SKUs &bull; Meta &ge; 95%
                                </span>
                              </div>

                              {b.observations && (
                                <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                                  <span className="font-bold text-slate-800">Observações da Triagem: </span>
                                  {b.observations}
                                </div>
                              )}

                              {divergentItems.length === 0 ? (
                                <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Carga 100% conforme. Nenhuma divergência física de SKUs identificada na auditoria.</span>
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs border border-slate-200 rounded">
                                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                                      <tr>
                                        <th className="py-2 px-3">Pallet</th>
                                        <th className="py-2 px-3">SKU</th>
                                        <th className="py-2 px-3">Descrição do Produto</th>
                                        <th className="py-2 px-3 text-right">Qtd Prevista</th>
                                        <th className="py-2 px-3 text-right">Qtd Conferida</th>
                                        <th className="py-2 px-3 text-center">Divergência</th>
                                        <th className="py-2 px-3">Tipo Inconformidade</th>
                                        <th className="py-2 px-3">Motivo da Divergência Informado</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {b.items.map((item, idx) => {
                                        const isDivergent = item.status === 'INCONFORME' || item.difference !== 0;
                                        return (
                                          <tr key={idx} className={isDivergent ? 'bg-rose-50/60 font-medium' : 'hover:bg-slate-50'}>
                                            <td className="py-2 px-3 text-slate-600 font-mono">P{item.palletNumber}</td>
                                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.sku}</td>
                                            <td className="py-2 px-3 text-slate-900">{item.description}</td>
                                            <td className="py-2 px-3 text-right font-mono text-slate-700">{item.expectedQuantity} {item.unit}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{item.inspectedQuantity} {item.unit}</td>
                                            <td className="py-2 px-3 text-center">
                                              {item.difference === 0 ? (
                                                <span className="text-emerald-600 font-semibold">0</span>
                                              ) : (
                                                <span className="font-mono font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                                  {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3">
                                              {item.nonConformityType === 'SKU_INVERTIDO' && <span className="text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">SKU Invertido</span>}
                                              {item.nonConformityType === 'QUANTIDADE_FALTA' && <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">Falta</span>}
                                              {item.nonConformityType === 'QUANTIDADE_EXCESSO' && <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">Sobra</span>}
                                              {item.nonConformityType === 'AVARIA_FISICA' && <span className="text-orange-700 font-bold bg-orange-100 px-1.5 py-0.5 rounded text-[10px]">Avaria</span>}
                                              {item.nonConformityType === 'EMBALAGEM_VIOLADA' && <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded text-[10px]">Emb. Violada</span>}
                                              {item.nonConformityType === 'LOTE_INVALIDO' && <span className="text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">Lote Inválido</span>}
                                              {item.nonConformityType === 'NONE' && <span className="text-emerald-700 text-[10px]">Conforme</span>}
                                            </td>
                                            <td className="py-2 px-3 text-slate-700 text-[11px] italic">
                                              {item.notes || '-'}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

