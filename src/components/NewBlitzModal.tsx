import React, { useState } from 'react';
import { X, Truck, Layers, Calendar, Plus, Play } from 'lucide-react';
import { Vehicle, BlitzInspection } from '../types/blitz';
import { getInspectorForDate } from '../data/initialData';
import { generateTruckLoadItems } from '../data/productCatalog';

interface NewBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedDate: string;
  onSaveBlitz: (blitz: BlitzInspection) => void;
}

export const NewBlitzModal: React.FC<NewBlitzModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  selectedDate,
  onSaveBlitz,
}) => {
  if (!isOpen) return null;

  const [selectedPlate, setSelectedPlate] = useState<string>(vehicles[0]?.plate || 'NPR2601');
  const [mapNumber, setMapNumber] = useState<string>(`MAP-${Math.floor(80000 + Math.random() * 9999)}`);
  const [route, setRoute] = useState<string>('Rota 04 - Distribuição Centro/Leste');
  const [dockNumber, setDockNumber] = useState<string>('Doca 01');
  const [time, setTime] = useState<string>('09:00');
  const [inspectorName, setInspectorName] = useState<string>(getInspectorForDate(selectedDate));

  const chosenVehicle = vehicles.find(v => v.plate === selectedPlate) || vehicles[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenVehicle) return;

    const truckItems = generateTruckLoadItems(chosenVehicle.palletCapacity, 2900);
    const totalExpected = truckItems.reduce((sum, item) => sum + item.expectedQuantity, 0);

    const newBlitz: BlitzInspection = {
      id: `blitz-${selectedDate.replace(/-/g, '')}-${chosenVehicle.plate}-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      time: time,
      vehiclePlate: chosenVehicle.plate,
      palletCapacity: chosenVehicle.palletCapacity,
      mapNumber: mapNumber.trim() || 'MAP-00000',
      route: route.trim() || 'Rota Geral',
      dockNumber: dockNumber.trim() || 'Doca 01',
      driverCode: chosenVehicle.driverCode || 'G0019283',
      driverName: chosenVehicle.driverName || 'Motorista Operacional',
      carrier: chosenVehicle.carrier || 'Transportadora Padrão',
      inspectorName: inspectorName,
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
      observations: 'Blitz manual de triagem física (~2.900 SKUs).'
    };

    onSaveBlitz(newBlitz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nova Blitz / Aferição de Carga
              </h3>
              <p className="text-[11px] text-slate-500">Carga padrão de ~2.900 SKUs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Selecione o Veículo / Placa</label>
            <select
              value={selectedPlate}
              onChange={(e) => setSelectedPlate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.plate}>
                  {v.plate} ({v.palletCapacity} pallets) &bull; {v.driverCode} {v.driverName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mapa de Carga</label>
              <input
                type="text"
                required
                value={mapNumber}
                onChange={(e) => setMapNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-semibold focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Doca de Aferição</label>
              <input
                type="text"
                value={dockNumber}
                onChange={(e) => setDockNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Rota / Destino</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Horário</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Conferente Diurno</label>
              <select
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                <option value="Gilson">Gilson (14/Abr em diante)</option>
                <option value="Nixon Henrique">Nixon Henrique (Até Abr)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Criar Carga e Iniciar Triagem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
