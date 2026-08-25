import React, { useState } from 'react';
import { 
  Truck, 
  Layers, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Search, 
  Calendar, 
  ShieldAlert, 
  Percent,
  Edit2
} from 'lucide-react';
import { Vehicle, BlitzInspection } from '../types/blitz';

interface VehicleFleetManagerProps {
  vehicles: Vehicle[];
  blitzes: BlitzInspection[];
  onStartBlitzForVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (newVehicle: { plate: string; palletCapacity: number; driverName?: string; carrier?: string }) => void;
}

export const VehicleFleetManager: React.FC<VehicleFleetManagerProps> = ({
  vehicles,
  blitzes,
  onStartBlitzForVehicle,
  onAddVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(10);
  const [newDriver, setNewDriver] = useState('');
  const [newCarrier, setNewCarrier] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.driverName && v.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.driverCode && v.driverCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.carrier && v.carrier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    onAddVehicle({
      plate: newPlate.toUpperCase().trim(),
      palletCapacity: Number(newCapacity) || 10,
      driverName: newDriver.trim() || 'Motorista Operacional',
      carrier: newCarrier.trim() || 'Transportadora Parceira',
    });
    setNewPlate('');
    setNewDriver('');
    setNewCarrier('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="vehicle-fleet-container" className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <span>Frota de Veículos & Motoristas Oficiais (16 Caminhões)</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {vehicles.length} Veículos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Placas e motoristas sorteados diariamente (2 veículos/dia) para triagem física e validação da meta corporativa (&ge; 97% de aderência).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar placa, código ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-vehicle-fleet"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Veículo</span>
          </button>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => {
          // Calculate vehicle real metrics from all blitzes
          const vehicleBlitzes = blitzes.filter(b => b.vehiclePlate === vehicle.plate);
          const totalExp = vehicleBlitzes.reduce((s, b) => s + (b.totalItemsExpected || 0), 0);
          const totalInsp = vehicleBlitzes.reduce((s, b) => s + (b.totalItemsInspected || 0), 0);
          const totalErr = vehicleBlitzes.reduce((s, b) => s + (b.totalErrors || 0), 0);
          const div = totalInsp > 0 ? totalInsp : (totalExp > 0 ? totalExp : 1);
          const errorRate = div > 0 ? Number(((totalErr / div) * 100).toFixed(2)) : 0;
          const adherenceRate = Math.max(0, 100 - errorRate);
          const isAlert = errorRate > 3.0 || adherenceRate < 97.0;

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                isAlert ? 'border-rose-300 ring-1 ring-rose-400' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Plate & Capacity */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center font-mono font-bold shadow-inner">
                      <span className="text-[9px] text-blue-400">BR</span>
                      <span className="text-xs leading-none">{vehicle.plate}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {vehicle.plate}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {vehicle.palletCapacity} pallets (~2.900 SKUs)
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    !isAlert ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {!isAlert ? '✓ ≥97% Conforme' : '⚠ <97% Alerta'}
                  </span>
                </div>

                {/* Driver / Carrier */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="text-slate-600 truncate" title={`${vehicle.driverCode} ${vehicle.driverName}`}>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Motorista Oficial:</span>
                    <span className="font-semibold text-slate-800">
                      {vehicle.driverCode ? `${vehicle.driverCode} - ` : ''}{vehicle.driverName || 'Motorista Operacional'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {vehicle.carrier || 'Transportadora Frota'}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Inspeções:</span>
                    <span className="font-bold text-slate-800">{vehicleBlitzes.length} blitzes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Aderência:</span>
                    <span className={`font-extrabold ${isAlert ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {adherenceRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Taxa de Erro: <strong className="text-slate-700">{errorRate.toFixed(1)}%</strong>
                </span>

                <button
                  onClick={() => onStartBlitzForVehicle(vehicle)}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                  title="Criar blitz imediata para esta placa"
                >
                  <Play className="w-3 h-3 text-blue-400" />
                  <span>Aferir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Vehicle */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Cadastrar Novo Veículo na Frota</span>
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Placa do Veículo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC1D23 ou GHI-4567"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 uppercase focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Capacidade de Pallets (~2.900 SKUs)</label>
                <select
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value={6}>6 Pallets</option>
                  <option value={8}>8 Pallets</option>
                  <option value={10}>10 Pallets</option>
                  <option value={12}>12 Pallets</option>
                  <option value={14}>14 Pallets</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome do Motorista Oficial</label>
                <input
                  type="text"
                  placeholder="Ex: G0019283 - Carlos Eduardo"
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transportadora</label>
                <input
                  type="text"
                  placeholder="Ex: JSL / Transportes Ramos"
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                >
                  Cadastrar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
