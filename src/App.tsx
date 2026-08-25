import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  History, 
  FileText, 
  AlertTriangle,
  Layers,
  Calendar,
  UserCheck,
  CheckCircle2,
  TrendingDown,
  PackageCheck
} from 'lucide-react';
import { 
  Vehicle, 
  BlitzInspection, 
  DailyDraw, 
  FilterState, 
  MonthlyStats,
  ImportedDailyMap 
} from './types/blitz';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { AlertsBanner } from './components/AlertsBanner';
import { DailyBlitzSection } from './components/DailyBlitzSection';
import { ImportDailyMapsSection } from './components/ImportDailyMapsSection';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { BlitzHistoryTable } from './components/BlitzHistoryTable';
import { VehicleFleetManager } from './components/VehicleFleetManager';
import { ReportPdfExport } from './components/ReportPdfExport';
import { InspectionModal } from './components/InspectionModal';
import { NewBlitzModal } from './components/NewBlitzModal';
import { AlertsBellDrawer } from './components/AlertsBellDrawer';
import { generateTruckLoadItems } from './data/productCatalog';
import { TOTAL_EXPEDITED_VEHICLES, getInspectorForDate } from './data/initialData';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'daily' | 'import-maps' | 'dashboard' | 'history' | 'fleet' | 'report'>('daily');
  
  // Date State (Defaults to 2026-08-25 as per current operation context)
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-25');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Core Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [blitzes, setBlitzes] = useState<BlitzInspection[]>([]);
  const [dailyDraw, setDailyDraw] = useState<DailyDraw | null>(null);
  const [importedMaps, setImportedMaps] = useState<ImportedDailyMap[]>([]);

  // Modals & Drawers
  const [activeInspectionBlitz, setActiveInspectionBlitz] = useState<BlitzInspection | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isNewBlitzModalOpen, setIsNewBlitzModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  // Filters for History Table
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    dateFilterType: 'ALL',
    selectedDate: '2026-08-25',
    selectedMonth: '2026-08',
    startDate: '',
    endDate: '',
    selectedInspector: 'ALL',
    selectedPlate: 'ALL',
    statusFilter: 'ALL'
  });

  // Load initial data
  useEffect(() => {
    const loadedVehicles = StorageService.getVehicles();
    const loadedBlitzes = StorageService.getBlitzes();
    const loadedMaps = StorageService.getImportedMapsForDate(selectedDate);
    setVehicles(loadedVehicles);
    setBlitzes(loadedBlitzes);
    setImportedMaps(loadedMaps);

    // Initial Daily Draw for selected date
    const draw = StorageService.getOrCreateDailyDraw(selectedDate);
    setDailyDraw(draw);
  }, []);

  // When selectedDate changes, ensure daily draw and imported maps are available
  useEffect(() => {
    if (selectedDate) {
      const maps = StorageService.getImportedMapsForDate(selectedDate);
      setImportedMaps(maps);
      const draw = StorageService.getOrCreateDailyDraw(selectedDate);
      setDailyDraw(draw);
      const updatedBlitzes = StorageService.getBlitzes();
      setBlitzes(updatedBlitzes);
    }
  }, [selectedDate]);

  // Handle Redraw (Fair rotation using imported maps)
  const handleRedraw = () => {
    const confirmRedraw = window.confirm(
      'Deseja realizar um novo sorteio de 2 veículos para esta data? A plataforma sorteará com base nos mapas importados e no histórico de conferência.'
    );
    if (!confirmRedraw) return;

    try {
      const newDraw = StorageService.getOrCreateDailyDraw(selectedDate, true);
      setDailyDraw(newDraw);
      setBlitzes(StorageService.getBlitzes());
    } catch (e) {
      console.error(e);
    }
  };

  // Callback when maps are updated from Routine 03.02.36.02
  const handleMapsUpdated = () => {
    const updatedMaps = StorageService.getImportedMapsForDate(selectedDate);
    setImportedMaps(updatedMaps);
    // Refresh draw with new maps
    const draw = StorageService.getOrCreateDailyDraw(selectedDate, true);
    setDailyDraw(draw);
    setBlitzes(StorageService.getBlitzes());
  };

  // Save Blitz
  const handleSaveBlitz = (updatedBlitz: BlitzInspection) => {
    const saved = StorageService.saveBlitz(updatedBlitz);
    const allUpdated = StorageService.getBlitzes();
    setBlitzes(allUpdated);
    setVehicles(StorageService.getVehicles());

    // Trigger celebration if completed with adherence >= 97%
    if (saved.status === 'CONCLUIDA' && !saved.isAboveErrorThreshold && saved.adherencePercentage >= 97.0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#60a5fa']
        });
      } catch (e) {
        // ignore in tests
      }
    }
  };

  // Delete Blitz
  const handleDeleteBlitz = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de blitz?')) {
      StorageService.deleteBlitz(id);
      setBlitzes(StorageService.getBlitzes());
      setVehicles(StorageService.getVehicles());
    }
  };

  // Start Physical Triage on specific blitz
  const handleStartInspection = (blitz: BlitzInspection) => {
    setActiveInspectionBlitz(blitz);
    setIsInspectionModalOpen(true);
  };

  // Start Physical Triage directly from Imported Map
  const handleStartInspectionForMap = (map: ImportedDailyMap) => {
    const existing = blitzes.find(b => b.date === selectedDate && b.vehiclePlate === map.vehiclePlate);
    if (existing) {
      handleStartInspection(existing);
      return;
    }

    const inspector = getInspectorForDate(selectedDate);
    const truckItems = map.items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      sku: it.sku,
      description: it.description,
      price: it.price || 50,
      hectoFactor: it.hectoFactor || 0.1,
      palletNumber: it.palletNumber || (Math.floor(idx / 2) + 1),
      expectedQuantity: it.expectedQuantity,
      inspectedQuantity: 0,
      difference: 0,
      unit: it.unit || 'CX',
      status: 'CONFORME' as const,
      nonConformityType: 'NONE' as const,
      photos: []
    }));

    const totalExpected = truckItems.reduce((s, it) => s + it.expectedQuantity, 0);

    const newBlitz: BlitzInspection = {
      id: `blitz-${selectedDate.replace(/-/g, '')}-${map.vehiclePlate}-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      vehiclePlate: map.vehiclePlate,
      palletCapacity: map.palletCapacity,
      mapNumber: map.mapNumber,
      route: map.route,
      dockNumber: map.dockNumber || 'Doca 01',
      driverCode: map.driverCode || 'G1053',
      driverName: map.driverName || 'Motorista Operacional',
      carrier: map.carrier || 'TransLog Revenda',
      inspectorName: inspector,
      shift: 'DIURNO',
      status: 'PENDENTE',
      items: truckItems,
      totalItemsExpected: totalExpected,
      totalItemsInspected: 0,
      totalErrors: 0,
      errorPercentage: 0,
      adherencePercentage: 100,
      isAboveErrorThreshold: false,
      generalPhotos: [],
      observations: `Carga importada via Rotina 03.02.36.02 (${totalExpected.toLocaleString('pt-BR')} volumes).`
    };

    const saved = StorageService.saveBlitz(newBlitz);
    setBlitzes(StorageService.getBlitzes());
    handleStartInspection(saved);
  };

  // Start Blitz directly from Vehicle Fleet tab
  const handleStartBlitzForVehicle = (vehicle: Vehicle) => {
    // Check if there is an existing pending blitz today for this vehicle
    const existing = blitzes.find(b => b.date === selectedDate && b.vehiclePlate === vehicle.plate);
    if (existing) {
      handleStartInspection(existing);
    } else {
      // Create new blitz for this vehicle with ~2900 items
      const truckItems = generateTruckLoadItems(vehicle.palletCapacity, 2900);
      const totalExpected = truckItems.reduce((s, i) => s + i.expectedQuantity, 0);
      const inspector = getInspectorForDate(selectedDate);

      const newBlitz: BlitzInspection = {
        id: `blitz-${selectedDate.replace(/-/g, '')}-${vehicle.plate}-${Date.now().toString().slice(-4)}`,
        date: selectedDate,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        vehiclePlate: vehicle.plate,
        palletCapacity: vehicle.palletCapacity,
        mapNumber: `MAP-${Math.floor(84900 + Math.random() * 999)}`,
        route: `Rota Direta - Operação Especial`,
        dockNumber: 'Doca 02',
        driverCode: vehicle.driverCode || 'G0019283',
        driverName: vehicle.driverName || 'Motorista Operacional',
        carrier: vehicle.carrier || 'Transportadora Frota',
        inspectorName: inspector,
        shift: 'DIURNO',
        status: 'PENDENTE',
        items: truckItems,
        totalItemsExpected: totalExpected,
        totalItemsInspected: 0,
        totalErrors: 0,
        errorPercentage: 0,
        adherencePercentage: 100,
        isAboveErrorThreshold: false,
        generalPhotos: [],
        observations: 'Blitz iniciada manualmente a partir do gerenciador de frota (~2.900 SKUs).'
      };
      const saved = StorageService.saveBlitz(newBlitz);
      setBlitzes(StorageService.getBlitzes());
      handleStartInspection(saved);
    }
  };

  // Add Vehicle
  const handleAddVehicle = (newVeh: { plate: string; palletCapacity: number; driverName?: string; carrier?: string }) => {
    StorageService.addVehicle({
      ...newVeh,
      active: true,
    });
    setVehicles(StorageService.getVehicles());
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm('Deseja restaurar a base padrão da revenda (16 veículos, motoristas e blitzes)?')) {
      StorageService.resetToDefault();
      setVehicles(StorageService.getVehicles());
      setBlitzes(StorageService.getBlitzes());
      setImportedMaps(StorageService.getImportedMapsForDate(selectedDate));
      setDailyDraw(StorageService.getOrCreateDailyDraw(selectedDate));
    }
  };

  // Filtered blitzes for daily section
  const dailyBlitzes = useMemo(() => {
    return blitzes.filter(b => b.date === selectedDate);
  }, [blitzes, selectedDate]);

  // Filtered blitzes for history table
  const filteredBlitzes = useMemo(() => {
    return StorageService.filterBlitzes(blitzes, filter);
  }, [blitzes, filter]);

  // Filtered blitzes for dashboard by month
  const dashboardBlitzes = useMemo(() => {
    if (selectedMonth === 'ALL') return blitzes;
    return blitzes.filter(b => b.date.startsWith(selectedMonth));
  }, [blitzes, selectedMonth]);

  // Monthly stats calculated in real-time
  const monthlyStats = useMemo(() => {
    return StorageService.getMonthlyStats(blitzes);
  }, [blitzes]);

  // Critical Alerts (< 97% adherence / > 3% error)
  const blitzesWithAlert = useMemo(() => {
    return blitzes.filter(b => b.isAboveErrorThreshold);
  }, [blitzes]);

  const globalTotalExpected = blitzes.reduce((sum, b) => sum + (b.totalItemsExpected || 0), 0);
  const globalTotalInspected = blitzes.reduce((sum, b) => sum + (b.totalItemsInspected || 0), 0);
  const globalTotalErrors = blitzes.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
  const div = globalTotalInspected > 0 ? globalTotalInspected : (globalTotalExpected > 0 ? globalTotalExpected : 1);
  const globalErrorRate = div > 0 ? (globalTotalErrors / div) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        alertCount={blitzesWithAlert.length}
        importedMapsCount={importedMaps.length}
        onOpenNewBlitz={() => setIsNewBlitzModalOpen(true)}
        onResetData={handleResetData}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Global Critical Alerts Banner */}
        <AlertsBanner
          blitzesWithAlert={blitzesWithAlert}
          overallErrorRate={globalErrorRate}
          onSelectBlitz={handleStartInspection}
        />

        {/* Tab 1: Daily Blitz & Sorteio */}
        {activeTab === 'daily' && (
          <DailyBlitzSection
            selectedDate={selectedDate}
            dailyDraw={dailyDraw}
            dailyBlitzes={dailyBlitzes}
            onStartInspection={handleStartInspection}
            onRedraw={handleRedraw}
            onAddExtraVehicle={() => setIsNewBlitzModalOpen(true)}
            allVehicles={vehicles}
          />
        )}

        {/* Tab: Importar Mapas do Dia (Rotina 03.02.36.02) */}
        {activeTab === 'import-maps' && (
          <ImportDailyMapsSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            importedMaps={importedMaps}
            onMapsUpdated={handleMapsUpdated}
            onStartInspectionForMap={handleStartInspectionForMap}
            onTriggerDraw={() => {
              handleRedraw();
              setActiveTab('daily');
            }}
            allVehicles={vehicles}
          />
        )}

        {/* Tab 2: Dashboard & Metas (≥97%) */}
        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            blitzes={dashboardBlitzes}
            vehicles={vehicles}
            monthlyStats={monthlyStats}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}

        {/* Tab 3: History Table & Custom Filters */}
        {activeTab === 'history' && (
          <BlitzHistoryTable
            blitzes={filteredBlitzes}
            vehicles={vehicles}
            filter={filter}
            setFilter={setFilter}
            onEditBlitz={handleStartInspection}
            onDeleteBlitz={handleDeleteBlitz}
          />
        )}

        {/* Tab 4: Vehicle Fleet (16 Plates & Drivers) */}
        {activeTab === 'fleet' && (
          <VehicleFleetManager
            vehicles={vehicles}
            blitzes={blitzes}
            onStartBlitzForVehicle={handleStartBlitzForVehicle}
            onAddVehicle={handleAddVehicle}
          />
        )}

        {/* Tab 5: Printable PDF Report */}
        {activeTab === 'report' && (
          <ReportPdfExport
            blitzes={filteredBlitzes}
            vehicles={vehicles}
            monthlyStats={monthlyStats}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Blitz de Carregamento &bull; Aferição de Qualidade Ambev</span>
            <span className="text-emerald-400 font-semibold">| Meta Corporativa: &ge; 95.0% de Aderência (Erro &le; 5.0%)</span>
          </div>
          <div>
            Rotina 03.02.36.02 &bull; Universo Operacional: {TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')} carros (2 sorteios/dia útil)
          </div>
        </div>
      </footer>

      {/* Side Alerts Bell Drawer Panel */}
      <AlertsBellDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        blitzesWithAlert={blitzesWithAlert}
        onSelectBlitz={handleStartInspection}
      />

      {/* Modal: Physical Triage Inspection */}
      <InspectionModal
        blitz={activeInspectionBlitz}
        isOpen={isInspectionModalOpen}
        onClose={() => {
          setIsInspectionModalOpen(false);
          setActiveInspectionBlitz(null);
        }}
        onSave={handleSaveBlitz}
        allVehicles={vehicles}
      />

      {/* Modal: New Ad-hoc Blitz */}
      <NewBlitzModal
        isOpen={isNewBlitzModalOpen}
        onClose={() => setIsNewBlitzModalOpen(false)}
        vehicles={vehicles}
        selectedDate={selectedDate}
        onSaveBlitz={handleSaveBlitz}
      />

    </div>
  );
}

