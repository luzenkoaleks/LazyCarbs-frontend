// Definiert die Struktur der Daten, die an das Backend gesendet werden (Request)
export interface CalculationRequest {
  mealCarbs: number;
  mealCalories: number;
  usualBeCalories: number;
  insulinTypeCalorieCovering: number;
  currentHour: number;
  currentMinute: number;
  movementFactor: number;
  enableDatabaseStorage: boolean; // Feld für die Datenbank-Speicheroption
}

// Definiert die Struktur der Daten, die vom Backend empfangen werden (Response)
export interface CalculationResponse {
  mealCarbs: number;
  mealCalories: number;
  usualBeCalories: number;
  insulinTypeCalorieCovering: number;
  currentHour: number;
  currentMinute: number;
  usualBolusFactor: number;
  intermediateLeanBeFactor: number;
  intermediatePureCarbBeFactor: number;
  intermediateBeSum: number;
  intermediateBeCalories: number;
  intermediateFatProteinCalories: number;
  methodCorrectBeFactor: number;
  methodCalorieSurplus: number;
  methodDelayedCalorieBolus: number;
  methodCorrectBolusSum: number;
  methodFatProteinCalories: number;
  movementFactor: number;
  finalCorrectBolus: number;
  selectedMethodName: string;
  methodExplanation: string;
  statusMessage: string;
  dbStatus: string; // Feld für den Datenbank-Status
}

// NEU: Definiert die Struktur für einen stündlichen Bolusfaktor
export interface HourlyBolusFactor {
  hour: number;
  bolusFactor: number;
}