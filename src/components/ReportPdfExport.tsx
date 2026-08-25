import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  Calendar, 
  UserCheck, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { BlitzInspection, MonthlyStats, Vehicle } from '../types/blitz';

interface ReportPdfExportProps {
  blitzes: BlitzInspection[];
  vehicles: Vehicle[];
  monthlyStats: MonthlyStats[];
  selectedDate: string;
  selectedMonth: string;
}

export const ReportPdfExport: React.FC<ReportPdfExportProps> = ({
  blitzes,
  vehicles,
  monthlyStats,
  selectedDate,
  selectedMonth,
}) => {
  const totalBlitzes = blitzes.length;
  const totalItemsExpected = blitzes.reduce((sum, b) => sum + (b.totalItemsExpected || 0), 0);
  const totalItemsInspected = blitzes.reduce((sum, b) => sum + (b.totalItemsInspected || 0), 0);
  const totalErrors = blitzes.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
  
  const divisor = totalItemsInspected > 0 ? totalItemsInspected : (totalItemsExpected > 0 ? totalItemsExpected : 1);
  const globalErrorRate = divisor > 0 ? (totalErrors / divisor) * 100 : 0;
  const globalAdherenceRate = Math.max(0, 100 - globalErrorRate);
  const alertsCount = blitzes.filter(b => b.isAboveErrorThreshold).length;

  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Data', 'Horario', 'Placa', 'Motorista_Codigo', 'Motorista_Nome', 'Pallets', 'Mapa', 'Rota', 'Conferente', 'ItensPrevistos', 'ItensAferidos', 'Divergencias', 'TaxaErro_Pct', 'Aderencia_Pct', 'Status', 'Alerta_Abaixo_97Pct'];
    const rows = blitzes.map(b => [
      b.date,
      b.time,
      b.vehiclePlate,
      `"${b.driverCode || ''}"`,
      `"${b.driverName || ''}"`,
      b.palletCapacity,
      b.mapNumber,
      `"${b.route}"`,
      `"${b.inspectorName}"`,
      b.totalItemsExpected,
      b.totalItemsInspected,
      b.totalErrors,
      b.errorPercentage,
      b.adherencePercentage,
      b.status,
      b.isAboveErrorThreshold ? 'SIM' : 'NAO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laudo_blitz_carregamento_revenda_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="report-pdf-export-container" className="space-y-6">
      
      {/* Top Controls (Hidden on Print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Relatório Executivo & Laudo de Auditoria</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Laudo oficial de blitz de carregamento (&ge; 95% de aderência). Formatado para impressão em folha A4 e salvamento em PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            id="btn-export-csv"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            id="btn-print-pdf"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md print:shadow-none print:border-none print:p-0 text-slate-900 max-w-5xl mx-auto">
        
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                <Truck className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  RELATÓRIO DE BLITZ & AFERIÇÃO DE CARREGAMENTO
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Auditoria Física &bull; Ambev / Revenda &bull; Meta &ge; 95.0% de Aderência
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              <div className="text-slate-500">Ref: {selectedMonth === 'ALL' ? 'Histórico Geral' : selectedMonth}</div>
              <div className="font-bold text-emerald-700 mt-0.5">Meta Aderência: &ge; 95.0% (Erro &le; 5.0%)</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-center text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Blitzes Realizadas</span>
            <span className="text-xl font-black text-slate-900">{totalBlitzes}</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Volumes Auditados</span>
            <span className="text-xl font-black text-slate-900">{totalItemsExpected.toLocaleString('pt-BR')}</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Aderência Global</span>
            <span className={`text-xl font-black ${globalAdherenceRate >= 95 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {globalAdherenceRate.toFixed(2)}%
            </span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Taxa de Dispersão (Erro)</span>
            <span className={`text-xl font-black ${globalErrorRate > 5.0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {globalErrorRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Operational Guidelines & Inspector Info */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl mb-6 text-xs text-slate-700">
          <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Diretriz Operacional & Rotina 03.02.36.02:</span>
          </div>
          <p>
            Universo operacional de <strong>1.854 veículos expedidos</strong>. Sorteio e aferição física diária de <strong>2 veículos por dia útil</strong> (segunda a sexta, exceto feriados nacionais) por rotatividade entre os mapas importados da Rotina 03.02.36.02.
            Meta corporativa: aderência de carregamento superior ou igual a <strong>95.0%</strong> (dispersão máxima tolerada de 5.0%). 98% das divergências devem ser de no máximo 4 SKUs (invertido, falta ou sobra com motivo registrado) e o restante até 15 SKUs.
          </p>
        </div>

        {/* Monthly Performance Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            1. Desempenho Mensal vs Meta Corporativa (≥ 95.0%)
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Mês</th>
                  <th className="py-2 px-3 text-center">Blitzes</th>
                  <th className="py-2 px-3 text-center">Itens Auditados</th>
                  <th className="py-2 px-3 text-center">Divergências</th>
                  <th className="py-2 px-3 text-center">Aderência Real</th>
                  <th className="py-2 px-3 text-center">Meta Aderência</th>
                  <th className="py-2 px-3 text-center">Taxa Erro</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyStats.map((ms, idx) => (
                  <tr key={idx} className={ms.adherenceRate < 95.0 ? 'bg-rose-50/50' : ''}>
                    <td className="py-2 px-3 font-semibold text-slate-900">{ms.monthName}</td>
                    <td className="py-2 px-3 text-center">{ms.totalBlitzes}</td>
                    <td className="py-2 px-3 text-center">{ms.totalItems.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">{ms.totalErrors.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{ms.adherenceRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-center font-semibold text-slate-600">&ge; 95.0%</td>
                    <td className="py-2 px-3 text-center font-bold">{ms.realErrorRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ms.adherenceRate >= 95.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ms.adherenceRate >= 95.0 ? '✓ Aprovado' : '⚠ Abaixo da Meta'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Inspections Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            2. Detalhamento de Blitzes Inspecionadas ({blitzes.length} Registros)
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Placa / Pallets</th>
                  <th className="py-2 px-3">Motorista</th>
                  <th className="py-2 px-3">Mapa</th>
                  <th className="py-2 px-3">Conferente</th>
                  <th className="py-2 px-3 text-center">Itens (~2.900)</th>
                  <th className="py-2 px-3 text-center">Divergências</th>
                  <th className="py-2 px-3 text-center">Aderência (%)</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {blitzes.slice(0, 20).map((b) => (
                  <tr key={b.id} className={b.isAboveErrorThreshold ? 'bg-rose-50/40' : ''}>
                    <td className="py-2 px-3 font-medium">{b.date}</td>
                    <td className="py-2 px-3 font-bold font-mono">
                      {b.vehiclePlate} ({b.palletCapacity}p)
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {b.driverCode ? `${b.driverCode} - ` : ''}{b.driverName}
                    </td>
                    <td className="py-2 px-3">{b.mapNumber}</td>
                    <td className="py-2 px-3">{b.inspectorName}</td>
                    <td className="py-2 px-3 text-center">{b.totalItemsInspected.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">{b.totalErrors}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{b.adherencePercentage.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        !b.isAboveErrorThreshold ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {!b.isAboveErrorThreshold ? 'Conforme' : 'Alerta'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
              Conferente Diurno Responsável
            </div>
            <span className="text-[10px] text-slate-500">Nixon Henrique / Gilson</span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
              Supervisão de Expedição & Cargas
            </div>
            <span className="text-[10px] text-slate-500">Coordenação Logística</span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
              Garantia da Qualidade & Auditoria
            </div>
            <span className="text-[10px] text-slate-500">Gestão de Operações</span>
          </div>
        </div>

      </div>

    </div>
  );
};
