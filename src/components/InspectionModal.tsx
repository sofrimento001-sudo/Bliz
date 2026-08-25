import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Save, 
  UploadCloud, 
  Image as ImageIcon,
  ShieldAlert,
  Percent,
  FileCheck,
  User,
  MapPin,
  Truck,
  Eye,
  Search
} from 'lucide-react';
import { BlitzInspection, InspectionItem, NonConformityType, Vehicle } from '../types/blitz';
import { AMBEV_PRODUCT_CATALOG } from '../data/productCatalog';
import { getInspectorForDate } from '../data/initialData';

interface InspectionModalProps {
  blitz: BlitzInspection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlitz: BlitzInspection) => void;
  allVehicles: Vehicle[];
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  blitz,
  isOpen,
  onClose,
  onSave,
  allVehicles,
}) => {
  if (!isOpen || !blitz) return null;

  const [formData, setFormData] = useState<BlitzInspection>({ ...blitz });
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [showCatalogPicker, setShowCatalogPicker] = useState<boolean>(false);

  useEffect(() => {
    if (blitz) {
      setFormData({ ...blitz });
    }
  }, [blitz]);

  // Recalcular métricas em tempo real (Itens Divergentes x Itens Conferidos)
  const totalExpected = formData.items.reduce((acc, item) => acc + (Number(item.expectedQuantity) || 0), 0);
  const totalInspected = formData.items.reduce((acc, item) => acc + (Number(item.inspectedQuantity) || 0), 0);
  const totalErrors = formData.items.reduce((acc, item) => {
    const diff = Math.abs((Number(item.expectedQuantity) || 0) - (Number(item.inspectedQuantity) || 0));
    return acc + (item.status === 'INCONFORME' ? (diff > 0 ? diff : 1) : 0);
  }, 0);

  const divisor = totalInspected > 0 ? totalInspected : (totalExpected > 0 ? totalExpected : 1);
  const errorPercentage = divisor > 0 
    ? Number(((totalErrors / divisor) * 100).toFixed(2)) 
    : 0;
  const adherencePercentage = Number(Math.max(0, 100 - errorPercentage).toFixed(2));
  
  // Meta corporativa: Aderência >= 95% (Erro <= 5.0%)
  const isAlert = errorPercentage > 5.0 || adherencePercentage < 95.0;

  // Handle Item Changes
  const handleItemChange = (index: number, field: keyof InspectionItem, value: any) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };

    // Auto calculate difference and status
    if (field === 'expectedQuantity' || field === 'inspectedQuantity') {
      const exp = field === 'expectedQuantity' ? Number(value) || 0 : Number(item.expectedQuantity) || 0;
      const insp = field === 'inspectedQuantity' ? Number(value) || 0 : Number(item.inspectedQuantity) || 0;
      item.difference = insp - exp;
      if (item.difference !== 0) {
        item.status = 'INCONFORME';
        if (item.difference < 0 && item.nonConformityType === 'NONE') {
          item.nonConformityType = 'QUANTIDADE_FALTA';
        } else if (item.difference > 0 && item.nonConformityType === 'NONE') {
          item.nonConformityType = 'QUANTIDADE_EXCESSO';
        }
      } else if (item.nonConformityType === 'NONE' || item.nonConformityType === 'QUANTIDADE_FALTA' || item.nonConformityType === 'QUANTIDADE_EXCESSO') {
        item.status = 'CONFORME';
        item.nonConformityType = 'NONE';
      }
    }

    if (field === 'status') {
      if (value === 'CONFORME') {
        item.nonConformityType = 'NONE';
      } else if (item.nonConformityType === 'NONE') {
        item.nonConformityType = 'AVARIA_FISICA';
      }
    }

    updatedItems[index] = item;
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalItemsExpected: totalExpected,
      totalItemsInspected: totalInspected,
      totalErrors: totalErrors,
      errorPercentage: errorPercentage,
      adherencePercentage: adherencePercentage,
      isAboveErrorThreshold: isAlert,
    }));
  };

  const handleAddCatalogProduct = (prod: typeof AMBEV_PRODUCT_CATALOG[0]) => {
    const newItem: InspectionItem = {
      id: 'it_' + Math.random().toString(36).substring(2, 9),
      sku: prod.code,
      description: prod.description,
      price: prod.price,
      hectoFactor: prod.hectoFactor,
      palletNumber: (formData.items.length % formData.palletCapacity) + 1,
      expectedQuantity: 200,
      inspectedQuantity: 200,
      difference: 0,
      unit: prod.unit || 'CX',
      status: 'CONFORME',
      nonConformityType: 'NONE',
      photos: []
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setShowCatalogPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  // Upload photo to a specific item
  const handleItemPhotoUpload = (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].photos = [...(updatedItems[itemIndex].photos || []), base64];
        setFormData(prev => ({ ...prev, items: updatedItems }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload general blitz photo
  const handleGeneralPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setFormData(prev => ({
          ...prev,
          generalPhotos: [...(prev.generalPhotos || []), base64]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (statusToSet: 'EM_ANDAMENTO' | 'CONCLUIDA') => {
    const finalBlitz: BlitzInspection = {
      ...formData,
      status: statusToSet,
      totalItemsExpected: totalExpected,
      totalItemsInspected: totalInspected,
      totalErrors: totalErrors,
      errorPercentage: errorPercentage,
      adherencePercentage: adherencePercentage,
      isAboveErrorThreshold: isAlert,
      completedAt: statusToSet === 'CONCLUIDA' ? new Date().toISOString() : formData.completedAt
    };
    onSave(finalBlitz);
    onClose();
  };

  const filteredCatalog = AMBEV_PRODUCT_CATALOG.filter(p => 
    p.code.includes(catalogSearch) ||
    p.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(catalogSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-inner">
              {formData.vehiclePlate.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Triagem Física &bull; Placa {formData.vehiclePlate}
                </h3>
                <span className="bg-blue-800 text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-600/40">
                  {formData.palletCapacity} Pallets (~2.900 SKUs)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {formData.mapNumber} &bull; {formData.route} &bull; Motorista: {formData.driverCode ? `${formData.driverCode} - ` : ''}{formData.driverName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Quality Bar */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isAlert ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Itens no Mapa:</span>
              <span className="font-bold text-slate-900 text-sm">{totalExpected.toLocaleString('pt-BR')} un</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Itens Aferidos:</span>
              <span className="font-bold text-slate-900 text-sm">{totalInspected.toLocaleString('pt-BR')} un</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Divergências:</span>
              <span className={`font-bold text-sm ${totalErrors > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {totalErrors} un
              </span>
            </div>
          </div>

          {/* Right Metrics: Meta 95% vs Real */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Meta Aderência:</span>
              <span className="font-bold text-slate-700">&ge; 95.0%</span>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              isAlert 
                ? 'bg-rose-600 text-white border-rose-700' 
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}>
              <div className="text-right">
                <span className="text-[10px] opacity-80 block uppercase leading-none">Taxa de Erro:</span>
                <span className="text-base font-extrabold">{errorPercentage.toFixed(2)}%</span>
              </div>
              <div className="pl-2 border-l border-white/30 text-left">
                <span className="text-[10px] opacity-80 block uppercase leading-none">Aderência:</span>
                <span className="text-base font-extrabold">{adherencePercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Operational Rule Indicator */}
          <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <span className="font-medium">
              <strong>Regra Operacional Ambev:</strong> 98% das divergências devem ser de no máximo 4 SKUs (Invertido, Falta ou Sobra c/ motivo informado). Restante até 15 SKUs. Meta &ge; 95.0% de aderência.
            </span>
          </div>

          {/* Alert Message if < 95% */}
          {isAlert && (
            <div className="p-3.5 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Taxa de Inconformidade Abaixo da Meta Corporativa (Aderência &lt; 95%)</span>
                <span>
                  Este carregamento apresentou <strong>{adherencePercentage.toFixed(2)}% de aderência</strong> ({errorPercentage.toFixed(2)}% de erro / divergências). A mercadoria NÃO deve ser liberada na portaria sem regularização física e alinhamento com a supervisão.
                </span>
              </div>
            </div>
          )}

          {/* Logistics Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Mapa de Carregamento</label>
              <input
                type="text"
                value={formData.mapNumber}
                onChange={(e) => setFormData({ ...formData, mapNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Rota / Destino</label>
              <input
                type="text"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Conferente Diurno</label>
              <select
                value={formData.inspectorName}
                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Gilson">Gilson (14/Abr em diante)</option>
                <option value="Nixon Henrique">Nixon Henrique (Até Abr)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Motorista da Revenda</label>
              <input
                type="text"
                value={`${formData.driverCode ? `${formData.driverCode} - ` : ''}${formData.driverName}`}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Items Physical Triage Table */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Itens e Produtos no Veículo (~2.900 SKUs)</span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {formData.items.length} itens mapeados
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  Aferição física de divergências: (Itens divergentes ÷ Itens conferidos &times; 100).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogPicker(!showCatalogPicker)}
                  id="btn-open-catalog-picker"
                  className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Produto do Catálogo</span>
                </button>
              </div>
            </div>

            {/* Catalog Quick Picker */}
            {showCatalogPicker && (
              <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl animate-fadeIn text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Catálogo de Produtos Ambev / Revenda
                  </span>
                  <button onClick={() => setShowCatalogPicker(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por SKU ou Descrição (ex: Skol, Brahma, Sukita, 347, 503)..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs mb-2 focus:ring-1 focus:ring-blue-500"
                />
                <div className="max-h-40 overflow-y-auto divide-y divide-blue-100 bg-white rounded-lg border border-blue-200">
                  {filteredCatalog.slice(0, 15).map(prod => (
                    <div 
                      key={prod.code} 
                      onClick={() => handleAddCatalogProduct(prod)}
                      className="p-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-700 mr-2">[{prod.code}]</span>
                        <span className="font-semibold text-slate-800">{prod.description}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({prod.category})</span>
                      </div>
                      <span className="text-blue-600 font-bold text-xs">+ Adicionar</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[340px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Pallet</th>
                      <th className="py-2.5 px-3 min-w-[220px]">Produto / SKU</th>
                      <th className="py-2.5 px-3 text-center">Previsto</th>
                      <th className="py-2.5 px-3 text-center">Aferido</th>
                      <th className="py-2.5 px-3 text-center">Diferença</th>
                      <th className="py-2.5 px-3">Status / Inconformidade</th>
                      <th className="py-2.5 px-3 text-center">Evidência</th>
                      <th className="py-2.5 px-2 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {formData.items.map((item, idx) => {
                      const hasDiff = item.difference !== 0;
                      return (
                        <tr key={item.id} className={hasDiff ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'}>
                          
                          {/* Pallet # */}
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="1"
                              max={formData.palletCapacity}
                              value={item.palletNumber || 1}
                              onChange={(e) => handleItemChange(idx, 'palletNumber', Number(e.target.value))}
                              className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold text-slate-800"
                            />
                          </td>

                          {/* Product SKU & Description */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 mb-1"
                              placeholder="Nome do produto"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                COD: {item.sku}
                              </span>
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="w-12 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-center text-slate-600"
                                placeholder="UN"
                              />
                            </div>
                          </td>

                          {/* Expected Qty */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.expectedQuantity}
                              onChange={(e) => handleItemChange(idx, 'expectedQuantity', e.target.value)}
                              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-semibold text-slate-800"
                            />
                          </td>

                          {/* Inspected Qty */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.inspectedQuantity}
                              onChange={(e) => handleItemChange(idx, 'inspectedQuantity', e.target.value)}
                              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-900"
                            />
                          </td>

                          {/* Difference */}
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              item.difference === 0 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : item.difference < 0 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.difference > 0 ? `+${item.difference}` : item.difference}
                            </span>
                          </td>

                          {/* Status & Non-Conformity Type */}
                          <td className="py-2.5 px-3">
                            <div className="space-y-1">
                              <select
                                value={item.status}
                                onChange={(e) => handleItemChange(idx, 'status', e.target.value)}
                                className={`w-full text-xs font-semibold rounded px-2 py-1 border ${
                                  item.status === 'CONFORME' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                              >
                                <option value="CONFORME">✓ Conforme</option>
                                <option value="INCONFORME">⚠ Inconforme / Divergente</option>
                              </select>

                              {item.status === 'INCONFORME' && (
                                <select
                                  value={item.nonConformityType}
                                  onChange={(e) => handleItemChange(idx, 'nonConformityType', e.target.value as NonConformityType)}
                                  className="w-full text-[11px] rounded px-1.5 py-0.5 bg-white border border-rose-200 text-rose-900 font-medium"
                                >
                                  <option value="QUANTIDADE_FALTA">Falta de Quantidade</option>
                                  <option value="QUANTIDADE_EXCESSO">Sobra / Excesso</option>
                                  <option value="SKU_INVERTIDO">SKU Invertido / Produto Trocado</option>
                                  <option value="AVARIA_FISICA">Avaria Física / Rasgo / Amassado</option>
                                  <option value="LOTE_INVALIDO">Lote Divergente / Validade</option>
                                  <option value="EMBALAGEM_VIOLADA">Embalagem Violada</option>
                                </select>
                              )}
                            </div>
                          </td>

                          {/* Photos upload / preview */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <label className="cursor-pointer p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors" title="Adicionar foto do item">
                                <Camera className="w-4 h-4" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleItemPhotoUpload(idx, e)} 
                                />
                              </label>

                              {item.photos && item.photos.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setActivePhotoModal(item.photos[0])}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Ver foto do item"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Delete Item */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Photo Gallery of Loading / Map Upload */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Evidências Fotográficas do Carregamento & Mapa
                </h4>
                <p className="text-[11px] text-slate-500">
                  Faça o upload de fotos do caminhão, prancheta do mapa e lacres para comprovação da blitz.
                </p>
              </div>

              <label className="cursor-pointer flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs">
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload de Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleGeneralPhotoUpload} 
                />
              </label>
            </div>

            {formData.generalPhotos && formData.generalPhotos.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {formData.generalPhotos.map((photo, pIdx) => (
                  <div key={pIdx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                    <img 
                      src={photo} 
                      alt={`Foto blitz ${pIdx + 1}`} 
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setActivePhotoModal(photo)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPhotos = formData.generalPhotos.filter((_, i) => i !== pIdx);
                        setFormData({ ...formData, generalPhotos: updatedPhotos });
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                Nenhuma foto anexada a esta blitz. Clique em "Upload de Foto" para registrar.
              </div>
            )}
          </div>

          {/* Observations & Corrective Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Parecer do Conferente ({formData.inspectorName})
              </label>
              <textarea
                rows={3}
                value={formData.observations || ''}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Descreva o estado físico da paletização, integridade do baú e conferência do mapa..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Plano de Ação Imediato / Correção no WMS
              </label>
              <textarea
                rows={3}
                value={formData.correctiveActions || ''}
                onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                placeholder="Ações adotadas em caso de divergência (ex: troca de pallet, reemissão de mapa, estorno)..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Conferência assinada digitalmente por: <span className="font-semibold text-slate-800">{formData.inspectorName}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave('EM_ANDAMENTO')}
              id="btn-save-draft"
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Salvar Rascunho
            </button>

            <button
              type="button"
              onClick={() => handleSave('CONCLUIDA')}
              id="btn-complete-blitz"
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold transition-colors shadow-sm ${
                isAlert ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Concluir e Validar Aferição</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox for Photos */}
      {activePhotoModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={activePhotoModal} 
              alt="Evidência fotográfica" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-3 -right-3 bg-white text-black p-1.5 rounded-full shadow-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
