export type NonConformityType = 
  | 'NONE'
  | 'QUANTIDADE_FALTA'
  | 'QUANTIDADE_EXCESSO'
  | 'SKU_INVERTIDO'
  | 'AVARIA_FISICA'
  | 'LOTE_INVALIDO'
  | 'EMBALAGEM_VIOLADA';

export interface Driver {
  code: string; // e.g. G1053
  name: string; // e.g. ADELSON SANTOS DE ARAUJO
  carrier?: string;
  status?: 'ATIVO' | 'INATIVO';
}

export interface ProductCatalogItem {
  code: string; // COD e.g. 347, 503, 9083
  description: string; // DESCRIÇÃO PRODUTO
  price: number; // VALOR (R$)
  hectoFactor: number; // FATOR HECTO
  category?: string;
  unit?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  palletCapacity: number;
  driverCode?: string;
  driverName?: string;
  carrier?: string;
  active: boolean;
  totalInspections: number;
  lastInspectionDate?: string;
  averageErrorRate: number;
  notes?: string;
}

export interface InspectionItem {
  id: string;
  sku: string; // COD do produto
  description: string; // Descrição do produto
  price?: number;
  hectoFactor?: number;
  palletNumber?: number;
  expectedQuantity: number;
  inspectedQuantity: number;
  difference: number;
  unit: string;
  lot?: string;
  expiryDate?: string;
  status: 'CONFORME' | 'INCONFORME';
  nonConformityType: NonConformityType;
  notes?: string;
  photos: string[]; // Base64 or image URLs
}

export interface BlitzInspection {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  vehiclePlate: string;
  palletCapacity: number;
  mapNumber: string; // Mapa de Carregamento / Rota
  route: string;
  dockNumber?: string;
  driverCode?: string;
  driverName: string;
  carrier: string;
  inspectorName: 'Nixon Henrique' | 'Gilson' | string;
  shift: 'DIURNO' | 'NOTURNO';
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  
  // Inspection items (products drawn inside vehicle)
  items: InspectionItem[];
  
  // Calculated stats (approx 2900 SKUs / volumes per truck)
  totalItemsExpected: number;
  totalItemsInspected: number;
  totalErrors: number;
  errorPercentage: number; // Dispersão (Taxa de Erro %)
  adherencePercentage: number; // Aderência % (100 - errorPercentage) >= 95%
  isAboveErrorThreshold: boolean; // errorPercentage > 5.0% (ou adherence < 95.0%)
  
  // General photos & notes
  generalPhotos: string[]; // Mapa, Carreta, Lacres
  observations?: string;
  correctiveActions?: string;
  inspectorSignature?: string;
  completedAt?: string;
}

export interface DailyDraw {
  date: string; // YYYY-MM-DD
  vehicles: {
    plate: string;
    palletCapacity: number;
    driverCode?: string;
    driverName?: string;
    blitzId?: string;
    drawnAt: string;
  }[];
  generatedBy: string;
  inspectorExpected: string;
}

export interface DailyMapItem {
  sku: string;
  description: string;
  expectedQuantity: number;
  unit: string;
  palletNumber?: number;
  price?: number;
  hectoFactor?: number;
}

export interface ImportedDailyMap {
  id: string;
  date: string; // YYYY-MM-DD
  mapNumber: string; // Ex: MAP-84920 ou 03.02.36.02
  vehiclePlate: string;
  palletCapacity: number;
  driverCode?: string;
  driverName?: string;
  carrier?: string;
  route: string;
  dockNumber?: string;
  totalVolumes: number;
  items: DailyMapItem[];
  importedAt: string;
  sourceRoutine: string; // '03.02.36.02'
}

export interface InspectorPerformance {
  name: string;
  totalBlitzesAudited: number;
  totalBlitzesWithErrors: number;
  percentageOfTotalCars: number; // % do total de carros conferidos na plataforma
  errorEncounterRate: number; // % de carros em que encontrou divergência
  totalVolumesInspected: number;
  totalErrorsDetected: number;
  averageErrorRate: number; // Dispersão %
  averageAdherenceRate: number; // Aderência %
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  monthName: string;
  totalBlitzes: number;
  totalItems: number;
  totalErrors: number;
  realErrorRate: number; // Real (%)
  targetErrorRate: number; // Meta máxima 5.0%
  adherenceRate: number; // Real Aderência (%) (Meta >= 95.0%)
  alertCount: number;
}

export interface FilterState {
  searchQuery: string;
  dateFilterType: 'ALL' | 'TODAY' | 'MONTH' | 'CUSTOM_DATE' | 'CUSTOM_RANGE';
  selectedDate: string; // YYYY-MM-DD
  selectedMonth: string; // YYYY-MM
  startDate: string;
  endDate: string;
  selectedInspector: string;
  selectedPlate: string;
  statusFilter: 'ALL' | 'CONFORME' | 'ALERTA' | 'PENDENTE';
}
