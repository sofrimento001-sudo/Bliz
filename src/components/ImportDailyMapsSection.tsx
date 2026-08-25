import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Truck, 
  Calendar, 
  RotateCcw, 
  Play, 
  Sparkles, 
  FileText, 
  Search,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ImportedDailyMap, DailyMapItem, Vehicle, BlitzInspection } from '../types/blitz';
import { StorageService } from '../services/storageService';
import { AMBEV_PRODUCT_CATALOG } from '../data/productCatalog';
import { isBusinessDay, TOTAL_EXPEDITED_VEHICLES } from '../data/initialData';

interface ImportDailyMapsSectionProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  importedMaps: ImportedDailyMap[];
  onMapsUpdated: () => void;
  onStartInspectionForMap: (map: ImportedDailyMap) => void;
  onTriggerDraw: () => void;
  allVehicles: Vehicle[];
}

export const ImportDailyMapsSection: React.FC<ImportDailyMapsSectionProps> = ({
  selectedDate,
  setSelectedDate,
  importedMaps,
  onMapsUpdated,
  onStartInspectionForMap,
  onTriggerDraw,
  allVehicles,
}) => {
  const [importMode, setImportMode] = useState<'upload' | 'paste' | 'auto'>('auto');
  const [pastedText, setPastedText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const businessDayInfo = isBusinessDay(selectedDate);

  // Download Modelo CSV Rotina 03.02.36.02
  const handleDownloadTemplate = () => {
    const headers = [
      'NUMERO_MAPA',
      'PLACA',
      'CAPACIDADE_PALLETS',
      'COD_MOTORISTA',
      'NOME_MOTORISTA',
      'TRANSPORTADORA',
      'ROTA',
      'DOCA',
      'COD_SKU',
      'DESCRICAO_PRODUTO',
      'QTD_PREVISTA',
      'UNIDADE',
      'NUM_PALLET'
    ];

    const sampleRows = [
      ['MAP-84901', 'NPR2601', '10', 'G1053', 'ADELSON SANTOS DE ARAUJO', 'TransLog Revenda', 'Rota 01 - Centro', 'Doca 01', '347', 'SKOL 600ML CX C/24 VD RET', '600', 'CX', '1'],
      ['MAP-84901', 'NPR2601', '10', 'G1053', 'ADELSON SANTOS DE ARAUJO', 'TransLog Revenda', 'Rota 01 - Centro', 'Doca 01', '503', 'BRAHMA CHOPP 600ML CX C/24 VD RET', '700', 'CX', '2'],
      ['MAP-84901', 'NPR2601', '10', 'G1053', 'ADELSON SANTOS DE ARAUJO', 'TransLog Revenda', 'Rota 01 - Centro', 'Doca 01', '1114', 'GUARANA ANTARCTICA 2L PET C/6', '800', 'FD', '3'],
      ['MAP-84901', 'NPR2601', '10', 'G1053', 'ADELSON SANTOS DE ARAUJO', 'TransLog Revenda', 'Rota 01 - Centro', 'Doca 01', '2349', 'BRAHMA DUPLO MALTE 350ML LATA C/12', '800', 'FD', '4'],
      ['MAP-84902', 'RLR8G79', '8', 'G1059', 'GILMAR DOS SANTOS FERNANDES', 'Viação Cargas', 'Rota 09 - Vale do Paraíba', 'Doca 03', '2546', 'SPATEN MUNICH 600ML CX C/24 VD RET', '980', 'CX', '1'],
      ['MAP-84902', 'RLR8G79', '8', 'G1059', 'GILMAR DOS SANTOS FERNANDES', 'Viação Cargas', 'Rota 09 - Vale do Paraíba', 'Doca 03', '982', 'PEPSI COLA 2L PET C/6', '1000', 'FD', '2'],
      ['MAP-84902', 'RLR8G79', '8', 'G1059', 'GILMAR DOS SANTOS FERNANDES', 'Viação Cargas', 'Rota 09 - Vale do Paraíba', 'Doca 03', '838', 'SUKITA LARANJA 2L PET C/6', '900', 'FD', '3'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...sampleRows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `modelo_rotina_03.02.36.02_mapa_carregamento.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV/TXT text parse
  const parseRawLinesToMaps = (content: string): ImportedDailyMap[] => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const mapsByPlate = new Map<string, {
      mapNumber: string;
      palletCapacity: number;
      driverCode: string;
      driverName: string;
      carrier: string;
      route: string;
      dockNumber: string;
      items: DailyMapItem[];
    }>();

    // Check if line 0 has header
    const startIndex = lines[0].toLowerCase().includes('placa') || lines[0].toLowerCase().includes('mapa') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const sep = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
      const cols = line.split(sep).map(c => c.replace(/^["']|["']$/g, '').trim());

      if (cols.length >= 6) {
        const mapNum = cols[0] || `MAP-${84900 + i}`;
        const plate = (cols[1] || `VEH${i}`).toUpperCase().replace(/[^A-Z0-9]/g, '');
        const palletCap = Number(cols[2]) || 10;
        const driverCode = cols[3] || 'G1000';
        const driverName = cols[4] || 'Motorista Operacional';
        const carrier = cols[5] || 'TransLog Revenda';
        const route = cols[6] || 'Rota Distribuição Ambev';
        const dock = cols[7] || 'Doca 01';
        
        const sku = cols[8] || `${300 + i}`;
        const desc = cols[9] || 'CERVEJA / REFRIGERANTE AMBEV';
        const qty = Number(cols[10]) || 500;
        const unit = cols[11] || 'CX';
        const palletNum = Number(cols[12]) || 1;

        const existing = mapsByPlate.get(plate) || {
          mapNumber: mapNum,
          palletCapacity: palletCap,
          driverCode: driverCode,
          driverName: driverName,
          carrier: carrier,
          route: route,
          dockNumber: dock,
          items: []
        };

        existing.items.push({
          sku,
          description: desc,
          expectedQuantity: qty,
          unit,
          palletNumber: palletNum,
        });

        mapsByPlate.set(plate, existing);
      }
    }

    const result: ImportedDailyMap[] = [];
    mapsByPlate.forEach((val, plate) => {
      const totalVol = val.items.reduce((s, it) => s + it.expectedQuantity, 0);
      result.push({
        id: `map-03023602-${selectedDate.replace(/-/g, '')}-${plate}`,
        date: selectedDate,
        mapNumber: val.mapNumber,
        vehiclePlate: plate,
        palletCapacity: val.palletCapacity,
        driverCode: val.driverCode,
        driverName: val.driverName,
        carrier: val.carrier,
        route: val.route,
        dockNumber: val.dockNumber,
        totalVolumes: totalVol,
        items: val.items,
        importedAt: new Date().toISOString(),
        sourceRoutine: '03.02.36.02'
      });
    });

    return result;
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseRawLinesToMaps(text);
        if (parsed.length === 0) {
          setFeedbackMessage({
            type: 'error',
            text: 'Não foi possível identificar os registros do arquivo. Verifique o padrão de colunas da Rotina 03.02.36.02.'
          });
          return;
        }

        StorageService.addImportedMaps(parsed);
        onMapsUpdated();
        setFeedbackMessage({
          type: 'success',
          text: `Sucesso! ${parsed.length} mapas de veículos importados para ${selectedDate} via Rotina 03.02.36.02.`
        });
      } catch (err) {
        console.error(err);
        setFeedbackMessage({
          type: 'error',
          text: 'Erro ao processar arquivo. Certifique-se de enviar um arquivo CSV ou texto legível.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle Paste Import
  const handlePasteImport = () => {
    if (!pastedText.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Cole os dados da Rotina 03.02.36.02 na caixa de texto.' });
      return;
    }

    const parsed = parseRawLinesToMaps(pastedText);
    if (parsed.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'Não foram encontrados registros válidos no texto colado. Use separação por tabulação ou ponto e vírgula.'
      });
      return;
    }

    StorageService.addImportedMaps(parsed);
    onMapsUpdated();
    setPastedText('');
    setFeedbackMessage({
      type: 'success',
      text: `${parsed.length} veículos carregados com sucesso para ${selectedDate}!`
    });
  };

  // Generate Official Day Load (Rotina 03.02.36.02)
  const handleGenerateOfficialDayLoad = () => {
    const generated = StorageService.generateSampleRoutineMaps(selectedDate);
    StorageService.addImportedMaps(generated);
    onMapsUpdated();
    setFeedbackMessage({
      type: 'success',
      text: `Carga oficial da Rotina 03.02.36.02 gerada com sucesso! ${generated.length} veículos carregados com SKUs Ambev (~2.900 volumes/caminhão).`
    });
  };

  // Filtered Maps list
  const filteredMaps = importedMaps.filter(m => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      m.vehiclePlate.toLowerCase().includes(q) ||
      m.mapNumber.toLowerCase().includes(q) ||
      (m.driverName && m.driverName.toLowerCase().includes(q)) ||
      (m.driverCode && m.driverCode.toLowerCase().includes(q)) ||
      m.route.toLowerCase().includes(q) ||
      m.dockNumber?.toLowerCase().includes(q)
    );
  });

  const totalVolumesAllMaps = importedMaps.reduce((s, m) => s + m.totalVolumes, 0);

  return (
    <div id="import-daily-maps-section" className="space-y-6">
      
      {/* Top Header Card with Routine Identification */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded shadow-2xs">
                ROTINA 03.02.36.02
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Relação de Carregamento & Mapa de Separação
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <PackageCheck className="w-7 h-7 text-blue-600" />
              <span>Importar Mapas do Dia para Sorteio</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Importe a relação oficial de veículos e itens que devem estar em cada caminhão através da <strong>Rotina 03.02.36.02</strong>. 
              A plataforma utiliza essa relação para sortear exatamente <strong>2 veículos por dia útil</strong> (Segunda a Sexta, exceto feriados) dentro do universo de <strong>{TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')} carros</strong> expedidos.
            </p>
          </div>

          {/* Date Selector & Business Day Status */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800">
              <Calendar className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
              <span className="font-semibold mr-2">Data do Mapa:</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-slate-900 font-bold focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${businessDayInfo.isBusinessDay ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] font-medium text-slate-600">
                {businessDayInfo.isBusinessDay 
                  ? 'Dia Útil de Operação (2 Sorteios)' 
                  : `${businessDayInfo.reason || 'Dia Não Útil'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Global Operation Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Universo Operacional</span>
            <span className="text-lg font-black text-slate-900">{TOTAL_EXPEDITED_VEHICLES.toLocaleString('pt-BR')}</span>
            <span className="text-[11px] text-slate-500 block">carros expedidos</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Mapas Importados (Hoje)</span>
            <span className="text-lg font-black text-blue-700">{importedMaps.length} veículos</span>
            <span className="text-[11px] text-slate-500 block">aptos para o sorteio</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total de SKUs / Volumes</span>
            <span className="text-lg font-black text-slate-900">{totalVolumesAllMaps.toLocaleString('pt-BR')} un</span>
            <span className="text-[11px] text-slate-500 block">previstos na 03.02.36.02</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Sorteio Diário</span>
            <span className="text-lg font-black text-emerald-700">2 carros / dia útil</span>
            <span className="text-[11px] text-slate-500 block">Seg a Sex (sem feriados)</span>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs ml-4">
            Fechar
          </button>
        </div>
      )}

      {/* Import Action Modes */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportMode('auto')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                importMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Carga do Dia (Rotina 03.02.36.02)
            </button>

            <button
              onClick={() => setImportMode('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                importMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Upload Arquivo (CSV / TXT)
            </button>

            <button
              onClick={() => setImportMode('paste')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                importMode === 'paste' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Colar Dados do ERP
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            id="btn-download-template"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Baixar planilha modelo da rotina 03.02.36.02"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Modelo 03.02.36.02</span>
          </button>
        </div>

        {/* Mode: Auto Generator */}
        {importMode === 'auto' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Sincronização Rápida de Mapas da Revenda ({selectedDate})</span>
                </h4>
                <p className="text-slate-600 mt-1">
                  Gera e carrega automaticamente os mapas da <strong>Rotina 03.02.36.02</strong> com a relação de todos os 16 veículos da frota, motoristas, rotas e caixas/fardos previstos (~2.900 SKUs Ambev por veículo).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleGenerateOfficialDayLoad}
                  id="btn-generate-official-load"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Carregar Mapas do Dia (03.02.36.02)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode: Upload */}
        {importMode === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <span className="font-bold text-slate-800 text-sm block">
              Selecione o arquivo da Rotina 03.02.36.02
            </span>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Formatos aceitos: <strong>.CSV</strong>, <strong>.TXT</strong> ou relatório de separação exportado do WMS/ERP.
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs">
              <span>Selecionar Arquivo</span>
              <input 
                type="file" 
                accept=".csv,.txt,.tsv" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        )}

        {/* Mode: Paste Text */}
        {importMode === 'paste' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Copie as linhas da <strong>Rotina 03.02.36.02</strong> da tela do seu ERP e cole abaixo:
            </p>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="MAP-84901;NPR2601;10;G1053;ADELSON SANTOS;TransLog;Rota 01;Doca 01;347;SKOL 600ML CX C/24;600;CX;1&#10;MAP-84901;NPR2601;10;G1053;ADELSON SANTOS;TransLog;Rota 01;Doca 01;503;BRAHMA CHOPP 600ML;700;CX;2..."
              className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePasteImport}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Processar e Salvar Mapas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List of Imported Maps for the Day */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Relação de Carregamentos Importados ({selectedDate})</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {importedMaps.length} Veículos
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Mapas cadastrados prontos para triagem física e sorteio aleatório de 2 carros diários.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar placa, rota, doca..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>

            {/* Sortear 2 Veículos dos Mapas */}
            <button
              onClick={onTriggerDraw}
              id="btn-sortear-mapas"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
              title="Realiza o sorteio diário de 2 veículos utilizando a rotina 03.02.36.02"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sortear 2 Veículos (Blitz)</span>
            </button>
          </div>
        </div>

        {/* Table of Imported Maps */}
        {filteredMaps.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhum mapa importado para esta data.</p>
            <p className="mt-1">Utilize o botão acima "Carregar Mapas do Dia (03.02.36.02)" ou faça upload do arquivo.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Placa / Pallets</th>
                  <th className="py-2.5 px-3">Mapa</th>
                  <th className="py-2.5 px-3">Motorista Oficial</th>
                  <th className="py-2.5 px-3">Rota & Doca</th>
                  <th className="py-2.5 px-3 text-center">Volumes Previstos</th>
                  <th className="py-2.5 px-3 text-center">Qtd SKUs</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMaps.map((map) => {
                  const isExpanded = expandedMapId === map.id;

                  return (
                    <React.Fragment key={map.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-blue-50/40' : ''}`}>
                        <td className="py-2.5 px-3 font-bold font-mono text-slate-900 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px]">
                            {map.vehiclePlate}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans font-medium">
                            {map.palletCapacity} pallets
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {map.mapNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          <span className="font-medium">{map.driverCode}</span> - {map.driverName}
                          <span className="block text-[10px] text-slate-500">{map.carrier}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <span className="font-medium">{map.route}</span>
                          <span className="block text-[10px] text-slate-500">{map.dockNumber || 'Doca 01'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {map.totalVolumes.toLocaleString('pt-BR')} un
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                          {map.items.length} produtos
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setExpandedMapId(isExpanded ? null : map.id)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                              title="Ver lista de SKUs e volumes previstos"
                            >
                              <span>Itens ({map.items.length})</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <button
                              onClick={() => onStartInspectionForMap(map)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                              title="Iniciar blitz imediata com os itens deste mapa"
                            >
                              <Play className="w-3 h-3" />
                              <span>Aferir</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded View with Item list from Routine 03.02.36.02 */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-4 bg-slate-50 border-t border-b border-blue-200">
                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                                  Itens Previstos no Veículo {map.vehiclePlate} (Rotina 03.02.36.02 - {map.mapNumber})
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Total: <strong>{map.totalVolumes.toLocaleString('pt-BR')} volumes</strong> distribuídos na carga
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs max-h-56 overflow-y-auto pr-1">
                                {map.items.map((it, idx) => (
                                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                    <div>
                                      <span className="font-mono font-bold text-blue-700 mr-1.5">{it.sku}</span>
                                      <span className="font-medium text-slate-800 truncate block text-[11px] max-w-[180px]">
                                        {it.description}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {it.expectedQuantity} {it.unit}
                                      </span>
                                      <span className="block text-[10px] text-slate-400">
                                        Pallet {it.palletNumber || 1}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
