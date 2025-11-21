export interface WavelengthData {
  color: string;
  name: string;
  wavelength: number; // in nm
  intensity: number; // Relative scattering intensity
}

export interface ScatteringState {
  sunAngle: number; // 0 to 180
  pathLength: number;
}

export enum SimulationMode {
  SIMULATION = 'SIMULATION',
  EXPLANATION = 'EXPLANATION',
}
