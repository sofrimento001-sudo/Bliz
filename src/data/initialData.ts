import { Vehicle, BlitzInspection, Driver } from '../types/blitz';
import { AMBEV_PRODUCT_CATALOG } from './productCatalog';

// Códigos e Nomes Oficiais dos Motoristas da Revenda (Extraídos da Planilha/Imagem Oficial)
export const REVENDA_DRIVERS: Driver[] = [
  { code: 'G1053', name: 'ADELSON SANTOS DE ARAUJO', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1082', name: 'CESARIO FERREIRA DE VASCONCELOS', carrier: 'Expresso Distribuição', status: 'ATIVO' },
  { code: 'G1019', name: 'DANILLO PEREIRA DOS SANTOS SILVA', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1034', name: 'EDENILSON DE SOUSA SILVA', carrier: 'Viação Cargas', status: 'ATIVO' },
  { code: 'G1164', name: 'EDGLEYDSON MENDES DA SILVA', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1111', name: 'EDILSON DE ANDRADE LIMA JUNIOR', carrier: 'Expresso Distribuição', status: 'ATIVO' },
  { code: 'G1020', name: 'EWERTON RODRIGUES DA SILVA', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1059', name: 'GILMAR DOS SANTOS FERNANDES', carrier: 'Viação Cargas', status: 'ATIVO' },
  { code: 'G1122', name: 'JEFFERSON JONES PAULINO COSTA', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1104', name: 'JOSE CARLOS DE LIMA ARAUJO', carrier: 'Expresso Distribuição', status: 'ATIVO' },
  { code: 'G1101', name: 'JOSE HONORIO DA SILVA', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1140', name: 'JOSE MATUZALEM PONTES DE OLIVEIRA', carrier: 'Viação Cargas', status: 'ATIVO' },
  { code: 'G1102', name: 'JOSENILSON INACIO DE ANDRADE', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1143', name: 'JOSICLAUDIO DE OLIVEIRA RODRIGUES', carrier: 'Expresso Distribuição', status: 'ATIVO' },
  { code: 'G1076', name: 'MANOEL ALVES DUTRA NETO', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1165', name: 'MARCIO DA SILVA QUEIROZ', carrier: 'Viação Cargas', status: 'ATIVO' },
  { code: 'G1162', name: 'THIAGO JOSE SANTINO DOS SANTOS', carrier: 'TransLog Revenda', status: 'ATIVO' },
  { code: 'G1049', name: 'VALDKLEBER DE SOUZA ALEXANDRE', carrier: 'Expresso Distribuição', status: 'ATIVO' },
];

// 16 Veículos fiéis da frota com placas, capacidades e motoristas vinculados
export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'NPR2601', palletCapacity: 10, driverCode: 'G1053', driverName: 'ADELSON SANTOS DE ARAUJO', carrier: 'TransLog Revenda', active: true, totalInspections: 14, averageErrorRate: 1.6 },
  { id: 'v2', plate: 'OX00532', palletCapacity: 8, driverCode: 'G1082', driverName: 'CESARIO FERREIRA DE VASCONCELOS', carrier: 'Expresso Distribuição', active: true, totalInspections: 13, averageErrorRate: 2.1 },
  { id: 'v3', plate: 'OX00542', palletCapacity: 8, driverCode: 'G1019', driverName: 'DANILLO PEREIRA DOS SANTOS SILVA', carrier: 'TransLog Revenda', active: true, totalInspections: 12, averageErrorRate: 3.8 }, // Alerta >3%
  { id: 'v4', plate: 'OX00552', palletCapacity: 6, driverCode: 'G1034', driverName: 'EDENILSON DE SOUSA SILVA', carrier: 'Viação Cargas', active: true, totalInspections: 11, averageErrorRate: 4.2 }, // Alerta >3%
  { id: 'v5', plate: 'OX00782', palletCapacity: 10, driverCode: 'G1164', driverName: 'EDGLEYDSON MENDES DA SILVA', carrier: 'TransLog Revenda', active: true, totalInspections: 15, averageErrorRate: 1.2 },
  { id: 'v6', plate: 'QFG1259', palletCapacity: 8, driverCode: 'G1111', driverName: 'EDILSON DE ANDRADE LIMA JUNIOR', carrier: 'Expresso Distribuição', active: true, totalInspections: 12, averageErrorRate: 1.9 },
  { id: 'v7', plate: 'QSK7D92', palletCapacity: 10, driverCode: 'G1020', driverName: 'EWERTON RODRIGUES DA SILVA', carrier: 'TransLog Revenda', active: true, totalInspections: 16, averageErrorRate: 2.3 },
  { id: 'v8', plate: 'RLR8G79', palletCapacity: 8, driverCode: 'G1059', driverName: 'GILMAR DOS SANTOS FERNANDES', carrier: 'Viação Cargas', active: true, totalInspections: 13, averageErrorRate: 3.5 }, // Alerta >3%
  { id: 'v9', plate: 'RLU4H49', palletCapacity: 8, driverCode: 'G1122', driverName: 'JEFFERSON JONES PAULINO COSTA', carrier: 'TransLog Revenda', active: true, totalInspections: 14, averageErrorRate: 1.4 },
  { id: 'v10', plate: 'RLW0C17', palletCapacity: 6, driverCode: 'G1104', driverName: 'JOSE CARLOS DE LIMA ARAUJO', carrier: 'Expresso Distribuição', active: true, totalInspections: 10, averageErrorRate: 2.4 },
  { id: 'v11', plate: 'SLB3J76', palletCapacity: 10, driverCode: 'G1101', driverName: 'JOSE HONORIO DA SILVA', carrier: 'TransLog Revenda', active: true, totalInspections: 15, averageErrorRate: 0.9 },
  { id: 'v12', plate: 'SLB4A26', palletCapacity: 10, driverCode: 'G1140', driverName: 'JOSE MATUZALEM PONTES DE OLIVEIRA', carrier: 'Viação Cargas', active: true, totalInspections: 14, averageErrorRate: 2.2 },
  { id: 'v13', plate: 'SLB4A56', palletCapacity: 10, driverCode: 'G1102', driverName: 'JOSENILSON INACIO DE ANDRADE', carrier: 'TransLog Revenda', active: true, totalInspections: 13, averageErrorRate: 1.8 },
  { id: 'v14', plate: 'TOU7F39', palletCapacity: 8, driverCode: 'G1143', driverName: 'JOSICLAUDIO DE OLIVEIRA RODRIGUES', carrier: 'Expresso Distribuição', active: true, totalInspections: 12, averageErrorRate: 2.0 },
  { id: 'v15', plate: 'TOZ8B20', palletCapacity: 10, driverCode: 'G1076', driverName: 'MANOEL ALVES DUTRA NETO', carrier: 'TransLog Revenda', active: true, totalInspections: 15, averageErrorRate: 1.3 },
  { id: 'v16', plate: 'TOZ8B50', palletCapacity: 10, driverCode: 'G1165', driverName: 'MARCIO DA SILVA QUEIROZ', carrier: 'Viação Cargas', active: true, totalInspections: 14, averageErrorRate: 2.7 },
];

export const SAMPLE_PRODUCTS = AMBEV_PRODUCT_CATALOG;

// Total de veículos carregados/expedidos no universo operacional da revenda
export const TOTAL_EXPEDITED_VEHICLES = 1854;

// Feriados Nacionais e dias não úteis de 2026 (Brasil)
export const BRAZILIAN_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': 'Confraternização Universal (Ano Novo)',
  '2026-02-16': 'Carnaval (Segunda-feira)',
  '2026-02-17': 'Carnaval (Terça-feira)',
  '2026-04-03': 'Paixão de Cristo (Sexta-feira Santa)',
  '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Dia Mundial do Trabalho',
  '2026-06-04': 'Corpus Christi',
  '2026-09-07': 'Independência do Brasil',
  '2026-10-12': 'Nossa Senhora Aparecida',
  '2026-11-02': 'Finados',
  '2026-11-15': 'Proclamação da República',
  '2026-11-20': 'Dia Nacional de Zumbi e da Consciência Negra',
  '2026-12-25': 'Natal',
};

/**
 * Verifica se a data é um dia útil (Segunda a Sexta-feira, exceto feriados)
 */
export function isBusinessDay(dateStr: string): { isBusinessDay: boolean; reason?: string } {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return { isBusinessDay: true };
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado

  if (dayOfWeek === 0) {
    return { isBusinessDay: false, reason: 'Domingo (Sem expedição regular de rotina)' };
  }
  if (dayOfWeek === 6) {
    return { isBusinessDay: false, reason: 'Sábado (Dia não útil para rotina padrão)' };
  }

  if (BRAZILIAN_HOLIDAYS_2026[dateStr]) {
    return { isBusinessDay: false, reason: `Feriado: ${BRAZILIAN_HOLIDAYS_2026[dateStr]}` };
  }

  return { isBusinessDay: true };
}

// Conferentes Diurnos da Operação
export const CONFERENTES_DIURNOS = ['Gilson', 'Nixon Henrique'] as const;

export function getInspectorForDate(dateStr: string): 'Nixon Henrique' | 'Gilson' {
  // Alternância padrão ou conferente ativo do dia
  const parts = dateStr.split('-');
  const day = parts.length === 3 ? Number(parts[2]) : 1;
  return day % 2 === 0 ? 'Gilson' : 'Nixon Henrique';
}

// Histórico de Blitzes de Carregamento (~2900 volumes por caminhão, meta corporativa de aderência >= 95% / erro <= 5%)
// Regra Operacional: 98% das divergências são de no máximo 4 SKUs (Invertido, Falta ou Sobra c/ motivo), restante de até 15 SKUs.
export const INITIAL_BLITZ_RECORDS: BlitzInspection[] = [
  // Agosto 2026 (Atual)
  {
    id: 'blitz-20260825-01',
    date: '2026-08-25',
    time: '08:15',
    vehiclePlate: 'NPR2601',
    palletCapacity: 10,
    mapNumber: 'MAP-84920',
    route: 'Rota 04 - Distribuição Centro/Leste',
    dockNumber: 'Doca 03',
    driverCode: 'G1053',
    driverName: 'ADELSON SANTOS DE ARAUJO',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2900,
    totalItemsInspected: 2900,
    totalErrors: 6,
    errorPercentage: 0.21,
    adherencePercentage: 99.79,
    isAboveErrorThreshold: false,
    generalPhotos: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'],
    observations: 'Conferência física concluída com 99.79% de aderência (Meta ≥ 95%). Identificadas pequenas divergências pontuais de 2 e 4 volumes devidamente justificadas.',
    completedAt: '2026-08-25T08:50:00',
    items: [
      { id: 'i1', sku: '347', description: 'SKOL 600ML CX C/24 VD RET', price: 168.00, hectoFactor: 0.144, palletNumber: 1, expectedQuantity: 700, inspectedQuantity: 700, difference: 0, unit: 'CX', status: 'CONFORME', nonConformityType: 'NONE', photos: [] },
      { id: 'i2', sku: '503', description: 'BRAHMA CHOPP 600ML CX C/24 VD RET', price: 172.50, hectoFactor: 0.144, palletNumber: 2, expectedQuantity: 700, inspectedQuantity: 698, difference: -2, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 2 caixas por conferência na última fiada do pallet 02', photos: [] },
      { id: 'i3', sku: '1114', description: 'GUARANA ANTARCTICA 2L PET C/6', price: 47.90, hectoFactor: 0.120, palletNumber: 3, expectedQuantity: 750, inspectedQuantity: 750, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] },
      { id: 'i4', sku: '2349', description: 'BRAHMA DUPLO MALTE 350ML LATA C/12', price: 48.90, hectoFactor: 0.042, palletNumber: 4, expectedQuantity: 750, inspectedQuantity: 746, difference: -4, unit: 'FD', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de SKU: 4 fardos enviados na versão lata 269ml em vez de 350ml', photos: [] },
    ]
  },
  {
    id: 'blitz-20260825-02',
    date: '2026-08-25',
    time: '10:30',
    vehiclePlate: 'RLR8G79',
    palletCapacity: 8,
    mapNumber: 'MAP-84924',
    route: 'Rota 09 - Vale do Paraíba',
    dockNumber: 'Doca 07',
    driverCode: 'G1059',
    driverName: 'GILMAR DOS SANTOS FERNANDES',
    carrier: 'Viação Cargas',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'EM_ANDAMENTO',
    totalItemsExpected: 2880,
    totalItemsInspected: 1800,
    totalErrors: 165,
    errorPercentage: 5.73, // ALERTA (>5.0%, Aderência < 95%)
    adherencePercentage: 94.27,
    isAboveErrorThreshold: true,
    generalPhotos: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'],
    observations: 'Blitz em triagem física. Divergência acumulada de 165 volumes ultrapassa o limite da meta de 95% (Aderência 94.27%). Contém lote com 15 SKUs invertidos no box.',
    correctiveActions: 'Descarregamento imediato do pallet 03 para regularização do mapa antes da liberação na portaria.',
    items: [
      { id: 'i5', sku: '838', description: 'SUKITA LARANJA 2L PET C/6', price: 39.90, hectoFactor: 0.120, palletNumber: 1, expectedQuantity: 900, inspectedQuantity: 885, difference: -15, unit: 'FD', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de 15 fardos de Sukita Uva carregados no lugar de Sukita Laranja', photos: [] },
      { id: 'i6', sku: '2546', description: 'SPATEN MUNICH 600ML CX C/24 VD RET', price: 196.80, hectoFactor: 0.144, palletNumber: 2, expectedQuantity: 980, inspectedQuantity: 830, difference: -150, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta física decorrente de corte de estoque não atualizado no mapa de carga', photos: [] },
      { id: 'i7', sku: '982', description: 'PEPSI COLA 2L PET C/6', price: 44.50, hectoFactor: 0.120, palletNumber: 3, expectedQuantity: 1000, inspectedQuantity: 1000, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] },
    ]
  },
  {
    id: 'blitz-20260824-01',
    date: '2026-08-24',
    time: '08:00',
    vehiclePlate: 'SLB3J76',
    palletCapacity: 10,
    mapNumber: 'MAP-84801',
    route: 'Rota 01 - Capital Sul',
    dockNumber: 'Doca 02',
    driverCode: 'G1101',
    driverName: 'JOSE HONORIO DA SILVA',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2920,
    totalItemsInspected: 2920,
    totalErrors: 5,
    errorPercentage: 0.17,
    adherencePercentage: 99.83,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    observations: 'Excelente conformidade logística. Total de 2.920 volumes inspecionados com 99.83% de aderência. Divergência pontual de 3 fardos em excesso e 2 caixas em falta.',
    completedAt: '2026-08-24T08:45:00',
    items: [
      { id: 'i8', sku: '2319', description: 'SKOL PILSEN 350ML LATA C/12', price: 42.00, hectoFactor: 0.042, palletNumber: 1, expectedQuantity: 1400, inspectedQuantity: 1403, difference: 3, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_EXCESSO', notes: 'Sobra de 3 fardos por contagem a maior no picking de esteira', photos: [] },
      { id: 'i9', sku: '9085', description: 'BRAHMA CHOPP 473ML LATAO C/12', price: 58.80, hectoFactor: 0.05676, palletNumber: 2, expectedQuantity: 1520, inspectedQuantity: 1518, difference: -2, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 2 fardos no fechamento do pallet', photos: [] }
    ]
  },
  {
    id: 'blitz-20260824-02',
    date: '2026-08-24',
    time: '14:15',
    vehiclePlate: 'TOZ8B20',
    palletCapacity: 10,
    mapNumber: 'MAP-84815',
    route: 'Rota 05 - Litoral Norte',
    dockNumber: 'Doca 05',
    driverCode: 'G1076',
    driverName: 'MANOEL ALVES DUTRA NETO',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2900,
    totalItemsInspected: 2900,
    totalErrors: 4,
    errorPercentage: 0.14,
    adherencePercentage: 99.86,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    observations: 'Conferência rápida sem retenção de veículo. Apenas 4 caixas invertidas corrigidas.',
    completedAt: '2026-08-24T15:05:00',
    items: [
      { id: 'i10', sku: '2585', description: 'CORONA EXTRA 330ML LN C/24', price: 168.00, hectoFactor: 0.0792, palletNumber: 1, expectedQuantity: 1450, inspectedQuantity: 1446, difference: -4, unit: 'CX', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de 4 caixas de Corona Cero colocadas no lugar da Corona tradicional', photos: [] },
      { id: 'i11', sku: '1388', description: 'STELLA ARTOIS 275ML LN C/24', price: 142.80, hectoFactor: 0.066, palletNumber: 2, expectedQuantity: 1450, inspectedQuantity: 1450, difference: 0, unit: 'CX', status: 'CONFORME', nonConformityType: 'NONE', photos: [] }
    ]
  },

  // Julho 2026
  {
    id: 'blitz-20260718-01',
    date: '2026-07-18',
    time: '09:00',
    vehiclePlate: 'OX00552',
    palletCapacity: 6,
    mapNumber: 'MAP-83210',
    route: 'Rota 11 - Interior Oeste',
    dockNumber: 'Doca 01',
    driverCode: 'G1034',
    driverName: 'EDENILSON DE SOUSA SILVA',
    carrier: 'Viação Cargas',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2800,
    totalItemsInspected: 2800,
    totalErrors: 172,
    errorPercentage: 6.14, // ALERTA (>5.0%, Aderência < 95%)
    adherencePercentage: 93.86,
    isAboveErrorThreshold: true,
    generalPhotos: [],
    observations: 'Carga em não conformidade crítica (Aderência 93.86% < Meta de 95%). Corte de fardos e troca de pallets na montagem.',
    correctiveActions: 'Revisão do processo de picking e recontagem completa no box.',
    completedAt: '2026-07-18T09:55:00',
    items: [
      { id: 'i12', sku: '1388', description: 'STELLA ARTOIS 275ML LN C/24', price: 142.80, hectoFactor: 0.066, palletNumber: 1, expectedQuantity: 1400, inspectedQuantity: 1240, difference: -160, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta física no pallet 01 devido a atraso no reabastecimento do pulmão', photos: [] },
      { id: 'i13', sku: '7945', description: 'GUARANA ANTARCTICA 350ML LATA C/12', price: 39.60, hectoFactor: 0.042, palletNumber: 2, expectedQuantity: 1400, inspectedQuantity: 1388, difference: -12, unit: 'FD', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: '12 fardos de Guaraná Zero enviados no lugar de Guaraná Tradicional', photos: [] }
    ]
  },
  {
    id: 'blitz-20260722-02',
    date: '2026-07-22',
    time: '11:00',
    vehiclePlate: 'QSK7D92',
    palletCapacity: 10,
    mapNumber: 'MAP-83440',
    route: 'Rota 03 - Região Metropolitana',
    dockNumber: 'Doca 04',
    driverCode: 'G1020',
    driverName: 'EWERTON RODRIGUES DA SILVA',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2900,
    totalItemsInspected: 2900,
    totalErrors: 3,
    errorPercentage: 0.10,
    adherencePercentage: 99.90,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    observations: 'Carga com excelente aderência. Apenas 3 caixas com sobra identificada e ajustada.',
    completedAt: '2026-07-22T11:45:00',
    items: [
      { id: 'i14', sku: '1114', description: 'GUARANA ANTARCTICA 2L PET C/6', price: 47.90, hectoFactor: 0.120, palletNumber: 1, expectedQuantity: 1500, inspectedQuantity: 1500, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] },
      { id: 'i15', sku: '2350', description: 'BRAHMA DUPLO MALTE 600ML CX C/24 VD RET', price: 186.00, hectoFactor: 0.144, palletNumber: 2, expectedQuantity: 1400, inspectedQuantity: 1403, difference: 3, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_EXCESSO', notes: 'Sobra de 3 caixas por engano do separador na montagem do pallet', photos: [] }
    ]
  },

  // Junho 2026
  {
    id: 'blitz-20260610-01',
    date: '2026-06-10',
    time: '08:30',
    vehiclePlate: 'OX00782',
    palletCapacity: 10,
    mapNumber: 'MAP-82010',
    route: 'Rota 06 - Campinas e Região',
    dockNumber: 'Doca 06',
    driverCode: 'G1164',
    driverName: 'EDGLEYDSON MENDES DA SILVA',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2920,
    totalItemsInspected: 2920,
    totalErrors: 2,
    errorPercentage: 0.07,
    adherencePercentage: 99.93,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    observations: 'Conferência física limpa. 2 fardos de água com avaria substituídos de imediato.',
    completedAt: '2026-06-10T09:15:00',
    items: [
      { id: 'i16', sku: '2538', description: 'SPATEN MUNICH 350ML LATA C/12', price: 54.00, hectoFactor: 0.042, palletNumber: 1, expectedQuantity: 1460, inspectedQuantity: 1460, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] },
      { id: 'i17', sku: '6181', description: 'AGUA MINERAL INDAIA SEM GAS 500ML PET C/12', price: 21.60, hectoFactor: 0.060, palletNumber: 2, expectedQuantity: 1460, inspectedQuantity: 1458, difference: -2, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 2 fardos após descarte de garrafas vazadas', photos: [] }
    ]
  },
  {
    id: 'blitz-20260625-02',
    date: '2026-06-25',
    time: '13:40',
    vehiclePlate: 'SLB4A56',
    palletCapacity: 10,
    mapNumber: 'MAP-82450',
    route: 'Rota 08 - Vale do Ribeira',
    dockNumber: 'Doca 08',
    driverCode: 'G1102',
    driverName: 'JOSENILSON INACIO DE ANDRADE',
    carrier: 'TransLog Revenda',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2890,
    totalItemsInspected: 2890,
    totalErrors: 4,
    errorPercentage: 0.14,
    adherencePercentage: 99.86,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    observations: 'Aderência 99.86%. Divergências de 3 caixas em falta e 1 caixa invertida.',
    completedAt: '2026-06-25T14:20:00',
    items: [
      { id: 'i18', sku: '503', description: 'BRAHMA CHOPP 600ML CX C/24 VD RET', price: 172.50, hectoFactor: 0.144, palletNumber: 1, expectedQuantity: 1445, inspectedQuantity: 1442, difference: -3, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 3 caixas constatada na conferência de contagem', photos: [] },
      { id: 'i19', sku: '347', description: 'SKOL 600ML CX C/24 VD RET', price: 168.00, hectoFactor: 0.144, palletNumber: 2, expectedQuantity: 1445, inspectedQuantity: 1444, difference: -1, unit: 'CX', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de 1 caixa de Skol Beats misturada no pallet de cerveja', photos: [] }
    ]
  },

  // Maio 2026
  {
    id: 'blitz-20260515-01',
    date: '2026-05-15',
    time: '08:20',
    vehiclePlate: 'TOU7F39',
    palletCapacity: 8,
    mapNumber: 'MAP-81120',
    route: 'Rota 02 - Zona Leste',
    dockNumber: 'Doca 02',
    driverCode: 'G1143',
    driverName: 'JOSICLAUDIO DE OLIVEIRA RODRIGUES',
    carrier: 'Expresso Distribuição',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2850,
    totalItemsInspected: 2850,
    totalErrors: 5,
    errorPercentage: 0.18,
    adherencePercentage: 99.82,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    completedAt: '2026-05-15T09:05:00',
    items: [
      { id: 'i20', sku: '1898', description: 'BUDWEISER 330ML LN C/24', price: 129.60, hectoFactor: 0.0792, palletNumber: 1, expectedQuantity: 1425, inspectedQuantity: 1421, difference: -4, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 4 caixas na separação do box', photos: [] },
      { id: 'i21', sku: '7981', description: 'PEPSI COLA 350ML LATA C/12', price: 38.40, hectoFactor: 0.042, palletNumber: 2, expectedQuantity: 1425, inspectedQuantity: 1426, difference: 1, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_EXCESSO', notes: 'Sobra de 1 fardo por contagem excedente', photos: [] }
    ]
  },

  // Abril 2026
  {
    id: 'blitz-20260420-01',
    date: '2026-04-20',
    time: '09:15',
    vehiclePlate: 'SLB4A26',
    palletCapacity: 10,
    mapNumber: 'MAP-80512',
    route: 'Rota 07 - Sorocaba e Região',
    dockNumber: 'Doca 04',
    driverCode: 'G1140',
    driverName: 'JOSE MATUZALEM PONTES DE OLIVEIRA',
    carrier: 'Viação Cargas',
    inspectorName: 'Gilson',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2900,
    totalItemsInspected: 2900,
    totalErrors: 3,
    errorPercentage: 0.10,
    adherencePercentage: 99.90,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    completedAt: '2026-04-20T10:00:00',
    items: [
      { id: 'i22', sku: '347', description: 'SKOL 600ML CX C/24 VD RET', price: 168.00, hectoFactor: 0.144, palletNumber: 1, expectedQuantity: 1450, inspectedQuantity: 1448, difference: -2, unit: 'CX', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de 2 caixas com garrafas de Skol Puro Malte', photos: [] },
      { id: 'i23', sku: '1114', description: 'GUARANA ANTARCTICA 2L PET C/6', price: 47.90, hectoFactor: 0.120, palletNumber: 2, expectedQuantity: 1450, inspectedQuantity: 1449, difference: -1, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 1 fardo na amarração do pallet', photos: [] }
    ]
  },
  {
    id: 'blitz-20260408-01',
    date: '2026-04-08',
    time: '08:45',
    vehiclePlate: 'OX00542',
    palletCapacity: 8,
    mapNumber: 'MAP-79901',
    route: 'Rota 10 - Baixada Santista',
    dockNumber: 'Doca 03',
    driverCode: 'G1019',
    driverName: 'DANILLO PEREIRA DOS SANTOS SILVA',
    carrier: 'TransLog Revenda',
    inspectorName: 'Nixon Henrique',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2880,
    totalItemsInspected: 2880,
    totalErrors: 154,
    errorPercentage: 5.35, // ALERTA (>5.0%)
    adherencePercentage: 94.65,
    isAboveErrorThreshold: true,
    generalPhotos: [],
    observations: 'Conferente Nixon detectou troca de SKU em lote de 14 caixas e falta maior. Aderência 94.65% abaixo da meta corporativa de 95%.',
    correctiveActions: 'Substituição imediata na doca e estorno das caixas divergentes.',
    completedAt: '2026-04-08T09:35:00',
    items: [
      { id: 'i24', sku: '503', description: 'BRAHMA CHOPP 600ML CX C/24 VD RET', price: 172.50, hectoFactor: 0.144, palletNumber: 1, expectedQuantity: 1440, inspectedQuantity: 1426, difference: -14, unit: 'CX', status: 'INCONFORME', nonConformityType: 'SKU_INVERTIDO', notes: 'Inversão de 14 caixas de Brahma Chopp por Brahma Zero', photos: [] },
      { id: 'i25', sku: '2349', description: 'BRAHMA DUPLO MALTE 350ML LATA C/12', price: 48.90, hectoFactor: 0.042, palletNumber: 2, expectedQuantity: 1440, inspectedQuantity: 1300, difference: -140, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta física no pallet por corte no armazém', photos: [] }
    ]
  },

  // Março 2026
  {
    id: 'blitz-20260322-01',
    date: '2026-03-22',
    time: '08:10',
    vehiclePlate: 'QFG1259',
    palletCapacity: 8,
    mapNumber: 'MAP-78400',
    route: 'Rota 04 - Distribuição Centro/Leste',
    dockNumber: 'Doca 01',
    driverCode: 'G1111',
    driverName: 'EDILSON DE ANDRADE LIMA JUNIOR',
    carrier: 'Expresso Distribuição',
    inspectorName: 'Nixon Henrique',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2880,
    totalItemsInspected: 2880,
    totalErrors: 4,
    errorPercentage: 0.14,
    adherencePercentage: 99.86,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    completedAt: '2026-03-22T08:50:00',
    items: [
      { id: 'i26', sku: '6181', description: 'AGUA MINERAL INDAIA SEM GAS 500ML PET C/12', price: 21.60, hectoFactor: 0.060, palletNumber: 1, expectedQuantity: 1440, inspectedQuantity: 1438, difference: -2, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 2 fardos no pallet lateral', photos: [] },
      { id: 'i27', sku: '9083', description: 'BRAHMA CHOPP 350ML LATA C/12', price: 45.00, hectoFactor: 0.042, palletNumber: 2, expectedQuantity: 1440, inspectedQuantity: 1442, difference: 2, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_EXCESSO', notes: 'Sobra de 2 fardos de Brahma Chopp colocados a mais', photos: [] }
    ]
  },

  // Fevereiro 2026
  {
    id: 'blitz-20260214-01',
    date: '2026-02-14',
    time: '09:30',
    vehiclePlate: 'RLU4H49',
    palletCapacity: 8,
    mapNumber: 'MAP-77110',
    route: 'Rota 09 - Vale do Paraíba',
    dockNumber: 'Doca 05',
    driverCode: 'G1122',
    driverName: 'JEFFERSON JONES PAULINO COSTA',
    carrier: 'TransLog Revenda',
    inspectorName: 'Nixon Henrique',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2900,
    totalItemsInspected: 2900,
    totalErrors: 3,
    errorPercentage: 0.10,
    adherencePercentage: 99.90,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    completedAt: '2026-02-14T10:15:00',
    items: [
      { id: 'i28', sku: '347', description: 'SKOL 600ML CX C/24 VD RET', price: 168.00, hectoFactor: 0.144, palletNumber: 1, expectedQuantity: 1450, inspectedQuantity: 1447, difference: -3, unit: 'CX', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 3 caixas no estrado inferior', photos: [] },
      { id: 'i29', sku: '1114', description: 'GUARANA ANTARCTICA 2L PET C/6', price: 47.90, hectoFactor: 0.120, palletNumber: 2, expectedQuantity: 1450, inspectedQuantity: 1450, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] }
    ]
  },

  // Janeiro 2026
  {
    id: 'blitz-20260120-01',
    date: '2026-01-20',
    time: '08:00',
    vehiclePlate: 'TOZ8B50',
    palletCapacity: 10,
    mapNumber: 'MAP-75800',
    route: 'Rota 01 - Capital Sul',
    dockNumber: 'Doca 02',
    driverCode: 'G1165',
    driverName: 'MARCIO DA SILVA QUEIROZ',
    carrier: 'Viação Cargas',
    inspectorName: 'Nixon Henrique',
    shift: 'DIURNO',
    status: 'CONCLUIDA',
    totalItemsExpected: 2910,
    totalItemsInspected: 2910,
    totalErrors: 4,
    errorPercentage: 0.14,
    adherencePercentage: 99.86,
    isAboveErrorThreshold: false,
    generalPhotos: [],
    completedAt: '2026-01-20T08:55:00',
    items: [
      { id: 'i30', sku: '1114', description: 'GUARANA ANTARCTICA 2L PET C/6', price: 47.90, hectoFactor: 0.120, palletNumber: 1, expectedQuantity: 1455, inspectedQuantity: 1451, difference: -4, unit: 'FD', status: 'INCONFORME', nonConformityType: 'QUANTIDADE_FALTA', notes: 'Falta de 4 fardos de Guaraná 2L na paletização', photos: [] },
      { id: 'i31', sku: '2349', description: 'BRAHMA DUPLO MALTE 350ML LATA C/12', price: 48.90, hectoFactor: 0.042, palletNumber: 2, expectedQuantity: 1455, inspectedQuantity: 1455, difference: 0, unit: 'FD', status: 'CONFORME', nonConformityType: 'NONE', photos: [] }
    ]
  }
];
