export interface ComputeFieldOptions<TValueMapping = any> {
  computeProperty?: ComputeProperty;
  computescenario?: ComputeScenario;
  valueMapping?: ComputeFieldValueMapping<TValueMapping>;
}

export enum ComputeProperty {
  Tax = 1,
  Price = 2,
  FrontGross = 3,
  BackGross = 4,
}

export enum ComputeScenario {
  Default = 1,
  BHPH = 2
}

export interface ComputeOptions {
  computeProperty?: ComputeProperty;
  computescenario?: ComputeScenario;
  valueMapping?: ComputeValueMapping;
}

export interface ComputeFieldChange<T = any> {
  value: T;
  valueMapping: ComputeFieldValueMapping;
}

export type ComputeValueMapping<T = any> = (obj: T) => void;
export type ComputeFieldValueMapping<T = any> = (value: any, obj: T) => void;
