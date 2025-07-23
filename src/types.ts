export interface CalculationRequest {
  mealCarbs: number;
    mealCalories: number;
  usualBeCalories: number;
  insulinTypeCalorieCovering: number;
  currentHour: number;
  currentMinute: number;
  movementFactor: number;
  enableDatabaseStorage: boolean;
}

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
  dbStatus: string;
}

export interface HourlyBolusFactor {
  hour: number;
  bolusFactor: number;
}

export interface CalorieFactors {
  usualBeCalories: number;
  insulinTypeCalorieCovering: number;
}