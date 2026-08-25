import React from 'react';
import { 
  Truck, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  BarChart3, 
  History, 
  RotateCcw, 
  ShieldCheck, 
  PlusCircle,
  Clock,
  PackageCheck,
  Bell
} from 'lucide-react';
import { getInspectorForDate, TOTAL_EXPEDITED_VEHICLES } from '../data/initialData';

interface NavbarProps {
  activeTab: 'daily' | 'import-maps' | 'dashboard' | 'history' | 'fleet' | 'report';
  setActiveTab: (tab: 'daily' | 'import-maps' | 'dashboard' | 'history' | 'fleet' | 'report') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  alertCount: number;
  importedMapsCount?: number;
  onOpenNewBlitz: () => void;
  onResetData: () => void;
  onOpenAlertsDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedDate,
  setSelectedDate,
  alertCount,
  importedMapsCount = 0,
  onOpenNewBlitz,
  onResetData,
  onOpenAlertsDrawer
}) => {
  const currentInspector = getInspectorForDate(selectedDate);

  return (
    <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md print:hidden">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner text-white">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  BLITZ DE CARREGAMENTO &bull; AMBEV
                </h1>
                <span className="bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Meta &ge; 95% Aderência
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rotina 03.02.36.02 &bull; Universo {TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')} Carros &bull; 2 Sorteios / Dia Útil
              </p>
            </div>
          </div>

          {/* Quick Context Controls: Date, Active Inspector & Alerts Bell on the Right */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Date Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200">
              <Calendar className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                title="Data de operação e aferição"
              />
            </div>

            {/* Inspector Badge */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 text-blue-300 text-xs font-medium"
              title="Conferente responsável pela auditoria diurna"
            >
              <UserCheck className="w-4 h-4 shrink-0 text-blue-400" />
              <div className="text-left">
                <span className="block text-[10px] uppercase text-slate-400 leading-none">
                  Conferente Designado:
                </span>
                <span className="font-semibold text-white">{currentInspector}</span>
              </div>
            </div>

            {/* Nova Blitz Button */}
            <button
              onClick={onOpenNewBlitz}
              id="btn-nova-blitz-header"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Triagem</span>
            </button>

            {/* Notification Bell on Right Side */}
            <button
              onClick={onOpenAlertsDrawer}
              id="btn-alerts-bell"
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Alertas e Inconformidades de Carga"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              title="Restaurar dados padrões da revenda"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mt-4 pt-2 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('daily')}
            id="tab-daily"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sorteio & Triagem do Dia</span>
          </button>

          <button
            onClick={() => setActiveTab('import-maps')}
            id="tab-import-maps"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'import-maps'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <span>Importar Mapas do Dia (03.02.36.02)</span>
            {importedMapsCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {importedMapsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            id="tab-dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboards & Metas (≥95%)</span>
            {alertCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            id="tab-history"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Blitz</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            id="tab-fleet"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Frota, Placas & Motoristas (16)</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            id="tab-report"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatório & Exportar PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};

