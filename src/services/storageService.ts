import { Vehicle, BlitzInspection, DailyDraw, MonthlyStats, FilterState, ImportedDailyMap, DailyMapItem, InspectorPerformance } from '../types/blitz';
import { INITIAL_VEHICLES, INITIAL_BLITZ_RECORDS, getInspectorForDate, TOTAL_EXPEDITED_VEHICLES, isBusinessDay } from '../data/initialData';
import { generateTruckLoadItems, AMBEV_PRODUCT_CATALOG } from '../data/productCatalog';

const VEHICLES_KEY = 'blitz_vehicles_v2';
const BLITZES_KEY = 'blitz_inspections_v2';
const DRAWS_KEY = 'blitz_daily_draws_v2';
const DAILY_MAPS_KEY = 'blitz_routine_03023602_maps_v1';

export class StorageService {
  static getVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(VEHICLES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading vehicles', e);
    }
    this.saveVehicles(INITIAL_VEHICLES);
    return INITIAL_VEHICLES;
  }

  static saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  }

  static addVehicle(vehicle: Omit<Vehicle, 'id' | 'totalInspections' | 'averageErrorRate'>): Vehicle {
    const vehicles = this.getVehicles();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: 'v_' + Date.now(),
      totalInspections: 0,
      averageErrorRate: 0,
    };
    vehicles.push(newVehicle);
    this.saveVehicles(vehicles);
    return newVehicle;
  }

  static updateVehicle(updated: Vehicle): void {
    const vehicles = this.getVehicles().map(v => v.id === updated.id ? updated : v);
    this.saveVehicles(vehicles);
  }

  static getBlitzes(): BlitzInspection[] {
    try {
      const data = localStorage.getItem(BLITZES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading blitzes', e);
    }
    this.saveBlitzes(INITIAL_BLITZ_RECORDS);
    return INITIAL_BLITZ_RECORDS;
  }

  static saveBlitzes(blitzes: BlitzInspection[]): void {
    localStorage.setItem(BLITZES_KEY, JSON.stringify(blitzes));
    this.recalculateVehicleStats(blitzes);
  }

  static saveBlitz(blitz: BlitzInspection): BlitzInspection {
    const blitzes = this.getBlitzes();
    const existingIndex = blitzes.findIndex(b => b.id === blitz.id);
    
    // Recalculate stats for this blitz (itens divergentes x itens conferidos)
    const totalExpected = blitz.items.reduce((acc, item) => acc + (Number(item.expectedQuantity) || 0), 0);
    const totalInspected = blitz.items.reduce((acc, item) => acc + (Number(item.inspectedQuantity) || 0), 0);
    const totalErrors = blitz.items.reduce((acc, item) => {
      const diff = Math.abs((Number(item.expectedQuantity) || 0) - (Number(item.inspectedQuantity) || 0));
      return acc + (item.status === 'INCONFORME' ? (diff > 0 ? diff : 1) : 0);
    }, 0);

    // Percentual de acordo com o índice de itens divergentes x itens conferidos
    const divisor = totalInspected > 0 ? totalInspected : (totalExpected > 0 ? totalExpected : 1);
    const errorPercentage = divisor > 0 
      ? Number(((totalErrors / divisor) * 100).toFixed(2))
      : 0;
    
    // Conforme a regra de negócio: meta corporativa de aderência >= 95% (erro <= 5.0%)
    const adherencePercentage = Number((Math.max(0, 100 - errorPercentage)).toFixed(2));
    const isAboveErrorThreshold = errorPercentage > 5.0 || adherencePercentage < 95.0;

    const updatedBlitz: BlitzInspection = {
      ...blitz,
      totalItemsExpected: totalExpected,
      totalItemsInspected: totalInspected,
      totalErrors: totalErrors,
      errorPercentage: errorPercentage,
      adherencePercentage: adherencePercentage,
      isAboveErrorThreshold: isAboveErrorThreshold,
    };

    if (existingIndex >= 0) {
      blitzes[existingIndex] = updatedBlitz;
    } else {
      blitzes.unshift(updatedBlitz);
    }

    this.saveBlitzes(blitzes);
    return updatedBlitz;
  }

  static deleteBlitz(id: string): void {
    const blitzes = this.getBlitzes().filter(b => b.id !== id);
    this.saveBlitzes(blitzes);
  }

  static getDailyDraws(): Record<string, DailyDraw> {
    try {
      const data = localStorage.getItem(DRAWS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading daily draws', e);
    }
    return {};
  }

  static saveDailyDraws(draws: Record<string, DailyDraw>): void {
    localStorage.setItem(DRAWS_KEY, JSON.stringify(draws));
  }

  // --- Rotina 03.02.36.02: Mapas de Carregamento Importados ---
  static getImportedMaps(): ImportedDailyMap[] {
    try {
      const data = localStorage.getItem(DAILY_MAPS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading imported maps', e);
    }
    // Seed initial imported maps if empty
    const initialMaps = this.generateSampleRoutineMaps('2026-08-25');
    this.saveImportedMaps(initialMaps);
    return initialMaps;
  }

  static saveImportedMaps(maps: ImportedDailyMap[]): void {
    localStorage.setItem(DAILY_MAPS_KEY, JSON.stringify(maps));
  }

  static getImportedMapsForDate(dateStr: string): ImportedDailyMap[] {
    const all = this.getImportedMaps();
    const forDate = all.filter(m => m.date === dateStr);
    if (forDate.length === 0) {
      // Auto generate official maps for the day
      const generated = this.generateSampleRoutineMaps(dateStr);
      const combined = [...all.filter(m => m.date !== dateStr), ...generated];
      this.saveImportedMaps(combined);
      return generated;
    }
    return forDate;
  }

  static addImportedMaps(newMaps: ImportedDailyMap[]): void {
    const all = this.getImportedMaps();
    // Filter out same IDs or same plate/date if re-importing
    const filtered = all.filter(m => !newMaps.some(n => n.date === m.date && n.vehiclePlate === m.vehiclePlate));
    const updated = [...filtered, ...newMaps];
    this.saveImportedMaps(updated);
  }

  static clearImportedMapsForDate(dateStr: string): void {
    const all = this.getImportedMaps();
    const updated = all.filter(m => m.date !== dateStr);
    this.saveImportedMaps(updated);
  }

  /**
   * Gera mapas realistas da Rotina 03.02.36.02 para a frota da revenda
   */
  static generateSampleRoutineMaps(dateStr: string): ImportedDailyMap[] {
    const vehicles = this.getVehicles().filter(v => v.active);
    return vehicles.map((v, idx) => {
      const truckItems = generateTruckLoadItems(v.palletCapacity, 2800 + Math.floor(Math.random() * 200));
      const mapItems: DailyMapItem[] = truckItems.map(it => ({
        sku: it.sku,
        description: it.description,
        expectedQuantity: it.expectedQuantity,
        unit: it.unit,
        palletNumber: it.palletNumber,
        price: it.price,
        hectoFactor: it.hectoFactor
      }));
      const totalVol = mapItems.reduce((s, it) => s + it.expectedQuantity, 0);

      return {
        id: `map-03023602-${dateStr.replace(/-/g, '')}-${v.plate}`,
        date: dateStr,
        mapNumber: `MAP-${84900 + idx}`,
        vehiclePlate: v.plate,
        palletCapacity: v.palletCapacity,
        driverCode: v.driverCode || 'G1053',
        driverName: v.driverName || 'Motorista Operacional',
        carrier: v.carrier || 'TransLog Revenda',
        route: `Rota ${String(idx + 1).padStart(2, '0')} - Distribuição Ambev`,
        dockNumber: `Doca ${String((idx % 8) + 1).padStart(2, '0')}`,
        totalVolumes: totalVol,
        items: mapItems,
        importedAt: new Date().toISOString(),
        sourceRoutine: '03.02.36.02'
      };
    });
  }

  /**
   * Sorteio Diário com Algoritmo de Rotatividade Justa:
   * Sorteia exatamente 2 veículos por dia útil presentes na plataforma / mapas importados,
   * priorizando veículos com maior tempo desde a última conferência.
   */
  static getOrCreateDailyDraw(dateStr: string, forceRedraw = false): DailyDraw {
    const draws = this.getDailyDraws();
    if (draws[dateStr] && !forceRedraw) {
      return draws[dateStr];
    }

    // Verificar se existem mapas importados da Rotina 03.02.36.02 para esta data
    const dailyMaps = this.getImportedMapsForDate(dateStr);
    const vehicles = this.getVehicles().filter(v => v.active);
    
    if (vehicles.length === 0) {
      throw new Error('Nenhum veículo ativo cadastrado na plataforma');
    }

    const blitzes = this.getBlitzes();
    const inspector = getInspectorForDate(dateStr);

    // Calcular contagem de sorteios recentes para rotação justa
    const candidateVehicles = dailyMaps.length > 0 
      ? dailyMaps.map(m => {
          const veh = vehicles.find(v => v.plate === m.vehiclePlate) || {
            plate: m.vehiclePlate,
            palletCapacity: m.palletCapacity,
            driverCode: m.driverCode,
            driverName: m.driverName,
            carrier: m.carrier,
          };
          return { veh, map: m };
        })
      : vehicles.map(v => ({ veh: v, map: null as ImportedDailyMap | null }));

    const scoredCandidates = candidateVehicles.map(candidate => {
      const plate = candidate.veh.plate;
      const pastVehicleBlitzes = blitzes.filter(b => b.vehiclePlate === plate && b.date <= dateStr);
      const lastBlitz = pastVehicleBlitzes.sort((a, b) => b.date.localeCompare(a.date))[0];
      
      let daysSinceLast = 999;
      if (lastBlitz) {
        const d1 = new Date(dateStr).getTime();
        const d2 = new Date(lastBlitz.date).getTime();
        daysSinceLast = Math.max(0, Math.floor((d1 - d2) / (1000 * 3600 * 24)));
      }

      // Pontuação de rotatividade justa
      const rotationScore = (daysSinceLast * 10) - (pastVehicleBlitzes.length * 3) + (Math.random() * 2);
      return { ...candidate, rotationScore };
    });

    // Ordenar pelos maiores scores de rotatividade
    scoredCandidates.sort((a, b) => b.rotationScore - a.rotationScore);

    // Selecionar exatamente 2 veículos sorteados por dia
    const selected = scoredCandidates.slice(0, 2).map(item => ({
      plate: item.veh.plate,
      palletCapacity: item.veh.palletCapacity,
      driverCode: item.veh.driverCode,
      driverName: item.veh.driverName,
      drawnAt: new Date().toISOString(),
      mapData: item.map
    }));

    const newDraw: DailyDraw = {
      date: dateStr,
      vehicles: selected.map(s => ({
        plate: s.plate,
        palletCapacity: s.palletCapacity,
        driverCode: s.driverCode,
        driverName: s.driverName,
        drawnAt: s.drawnAt
      })),
      generatedBy: 'Rotina 03.02.36.02 - Sorteio de Rotatividade Justa (2 Veículos)',
      inspectorExpected: inspector,
    };

    draws[dateStr] = newDraw;
    this.saveDailyDraws(draws);

    // Criar ou atualizar rascunhos de Blitz pendentes com os itens reais da Rotina 03.02.36.02
    selected.forEach((s, index) => {
      const exists = blitzes.some(b => b.date === dateStr && b.vehiclePlate === s.plate);
      if (!exists) {
        let truckItems = s.mapData?.items.map((it, idx) => ({
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

        if (!truckItems || truckItems.length === 0) {
          truckItems = generateTruckLoadItems(s.palletCapacity, 2900);
        }

        const totalExp = truckItems.reduce((sum, it) => sum + it.expectedQuantity, 0);

        const newBlitzDraft: BlitzInspection = {
          id: `blitz-${dateStr.replace(/-/g, '')}-${s.plate}`,
          date: dateStr,
          time: index === 0 ? '08:15' : '10:30',
          vehiclePlate: s.plate,
          palletCapacity: s.palletCapacity,
          mapNumber: s.mapData?.mapNumber || `MAP-${Math.floor(84900 + Math.random() * 999)}`,
          route: s.mapData?.route || `Rota ${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')} - Distribuição Centro`,
          dockNumber: s.mapData?.dockNumber || `Doca ${String(Math.floor(1 + Math.random() * 8)).padStart(2, '0')}`,
          driverCode: s.driverCode || 'G1053',
          driverName: s.driverName || 'Motorista Operacional',
          carrier: s.mapData?.carrier || 'TransLog Revenda',
          inspectorName: inspector,
          shift: 'DIURNO',
          status: 'PENDENTE',
          items: truckItems,
          totalItemsExpected: totalExp,
          totalItemsInspected: 0,
          totalErrors: 0,
          errorPercentage: 0,
          adherencePercentage: 100,
          isAboveErrorThreshold: false,
          generalPhotos: [],
          observations: `Carga importada via Rotina 03.02.36.02 (${totalExp.toLocaleString('pt-BR')} volumes). Sorteio diário de 2 veículos.`
        };
        blitzes.push(newBlitzDraft);
      }
    });

    this.saveBlitzes(blitzes);
    return newDraw;
  }

  /**
   * Cálculo dos indicadores objetivos dos Conferentes (Percentual de Carros Conferidos e Encontro de Divergências)
   * Nenhuma menção a datas ou períodos históricos.
   */
  static getInspectorPerformance(blitzes: BlitzInspection[]): InspectorPerformance[] {
    const inspectors = ['Gilson', 'Nixon Henrique'];
    const totalBlitzesCount = blitzes.length > 0 ? blitzes.length : 1;

    return inspectors.map(inspectorName => {
      const insBlitzes = blitzes.filter(b => b.inspectorName === inspectorName);
      const totalAudited = insBlitzes.length;
      
      // Carros em que encontrou divergência (erros > 0 ou inconformidades)
      const blitzesWithErrors = insBlitzes.filter(b => b.totalErrors > 0 || b.items.some(i => i.status === 'INCONFORME'));
      const errorEncounterCount = blitzesWithErrors.length;
      
      // % de carros conferidos sobre o total geral
      const percentageOfTotalCars = Number(((totalAudited / totalBlitzesCount) * 100).toFixed(1));
      
      // % de carros com divergência encontrada em relação aos carros que ele conferiu
      const errorEncounterRate = totalAudited > 0
        ? Number(((errorEncounterCount / totalAudited) * 100).toFixed(1))
        : 0;

      const totalVolumes = insBlitzes.reduce((sum, b) => sum + (b.totalItemsExpected || 0), 0);
      const totalErrors = insBlitzes.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
      const totalInspected = insBlitzes.reduce((sum, b) => sum + (b.totalItemsInspected || 0), 0);

      const div = totalInspected > 0 ? totalInspected : (totalVolumes > 0 ? totalVolumes : 1);
      const averageErrorRate = div > 0 ? Number(((totalErrors / div) * 100).toFixed(2)) : 0;
      const averageAdherenceRate = Number(Math.max(0, 100 - averageErrorRate).toFixed(2));

      return {
        name: inspectorName,
        totalBlitzesAudited: totalAudited,
        totalBlitzesWithErrors: errorEncounterCount,
        percentageOfTotalCars: percentageOfTotalCars,
        errorEncounterRate: errorEncounterRate,
        totalVolumesInspected: totalVolumes,
        totalErrorsDetected: totalErrors,
        averageErrorRate: averageErrorRate,
        averageAdherenceRate: averageAdherenceRate
      };
    });
  }

  private static recalculateVehicleStats(blitzes: BlitzInspection[]): void {
    try {
      const vehicles = this.getVehicles();
      const updated = vehicles.map(vehicle => {
        const vehicleBlitzes = blitzes.filter(b => b.vehiclePlate === vehicle.plate && b.status === 'CONCLUIDA');
        const count = vehicleBlitzes.length;
        if (count === 0) {
          return { ...vehicle, totalInspections: 0, averageErrorRate: 0 };
        }
        const totalErrorSum = vehicleBlitzes.reduce((sum, b) => sum + b.errorPercentage, 0);
        const avg = Number((totalErrorSum / count).toFixed(2));
        const lastDate = vehicleBlitzes.sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
        return {
          ...vehicle,
          totalInspections: count,
          averageErrorRate: avg,
          lastInspectionDate: lastDate || vehicle.lastInspectionDate
        };
      });
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating vehicle stats', e);
    }
  }

  static getMonthlyStats(blitzes: BlitzInspection[]): MonthlyStats[] {
    const monthNames: Record<string, string> = {
      '01': 'Jan',
      '02': 'Fev',
      '03': 'Mar',
      '04': 'Abr',
      '05': 'Mai',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Ago',
      '09': 'Set',
      '10': 'Out',
      '11': 'Nov',
      '12': 'Dez',
    };

    const monthlyMap = new Map<string, { totalItems: number; totalErrors: number; count: number; alertCount: number }>();

    // Inicializar meses de 2026 de Janeiro a Agosto
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
    months.forEach(m => {
      monthlyMap.set(m, { totalItems: 0, totalErrors: 0, count: 0, alertCount: 0 });
    });

    blitzes.forEach(b => {
      const mKey = b.date.substring(0, 7);
      const current = monthlyMap.get(mKey) || { totalItems: 0, totalErrors: 0, count: 0, alertCount: 0 };
      current.totalItems += b.totalItemsExpected || 0;
      current.totalErrors += b.totalErrors || 0;
      current.count += 1;
      if (b.isAboveErrorThreshold) {
        current.alertCount += 1;
      }
      monthlyMap.set(mKey, current);
    });

    const result: MonthlyStats[] = [];
    monthlyMap.forEach((val, key) => {
      const monthPart = key.split('-')[1];
      const realErrorRate = val.totalItems > 0
        ? Number(((val.totalErrors / val.totalItems) * 100).toFixed(2))
        : 0;
      
      const adherenceRate = Number((Math.max(0, 100 - realErrorRate)).toFixed(2));

      result.push({
        monthKey: key,
        monthName: `${monthNames[monthPart] || monthPart}/26`,
        totalBlitzes: val.count,
        totalItems: val.totalItems,
        totalErrors: val.totalErrors,
        realErrorRate: realErrorRate,
        targetErrorRate: 5.0, // Meta máxima de 5.0% de erro (>=95% aderência)
        adherenceRate: adherenceRate,
        alertCount: val.alertCount
      });
    });

    return result.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }

  static filterBlitzes(blitzes: BlitzInspection[], filter: FilterState): BlitzInspection[] {
    return blitzes.filter(b => {
      // Busca geral
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matches = 
          b.vehiclePlate.toLowerCase().includes(q) ||
          b.mapNumber.toLowerCase().includes(q) ||
          b.driverName.toLowerCase().includes(q) ||
          (b.driverCode && b.driverCode.toLowerCase().includes(q)) ||
          b.carrier.toLowerCase().includes(q) ||
          b.route.toLowerCase().includes(q) ||
          b.inspectorName.toLowerCase().includes(q) ||
          b.items.some(it => it.sku.toLowerCase().includes(q) || it.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Filtro de Data
      if (filter.dateFilterType === 'TODAY') {
        if (b.date !== filter.selectedDate) return false;
      } else if (filter.dateFilterType === 'MONTH') {
        if (!b.date.startsWith(filter.selectedMonth)) return false;
      } else if (filter.dateFilterType === 'CUSTOM_DATE') {
        if (b.date !== filter.selectedDate) return false;
      } else if (filter.dateFilterType === 'CUSTOM_RANGE') {
        if (filter.startDate && b.date < filter.startDate) return false;
        if (filter.endDate && b.date > filter.endDate) return false;
      }

      // Filtro de Conferente
      if (filter.selectedInspector && filter.selectedInspector !== 'ALL') {
        if (b.inspectorName !== filter.selectedInspector) return false;
      }

      // Filtro de Placa
      if (filter.selectedPlate && filter.selectedPlate !== 'ALL') {
        if (b.vehiclePlate !== filter.selectedPlate) return false;
      }

      // Filtro de Status / Meta
      if (filter.statusFilter === 'ALERTA') {
        if (!b.isAboveErrorThreshold) return false;
      } else if (filter.statusFilter === 'CONFORME') {
        if (b.isAboveErrorThreshold || b.status === 'PENDENTE') return false;
      } else if (filter.statusFilter === 'PENDENTE') {
        if (b.status !== 'PENDENTE' && b.status !== 'EM_ANDAMENTO') return false;
      }

      return true;
    });
  }

  static resetToDefault(): void {
    localStorage.removeItem(VEHICLES_KEY);
    localStorage.removeItem(BLITZES_KEY);
    localStorage.removeItem(DRAWS_KEY);
    localStorage.removeItem(DAILY_MAPS_KEY);
    this.saveVehicles(INITIAL_VEHICLES);
    this.saveBlitzes(INITIAL_BLITZ_RECORDS);
  }
}
