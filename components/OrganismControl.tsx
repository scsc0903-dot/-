import React from 'react';
import type { OrganismConfig, OrganismType } from '../types';

interface OrganismControlProps {
  config: OrganismConfig;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

const OrganismControl: React.FC<OrganismControlProps> = ({ config, value, onChange, disabled }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={config.id} className="flex items-center gap-3">
          {config.icon}
          <div>
            <span className="font-bold text-gray-800">{config.name}</span>
            <p className="text-xs text-gray-500 -mt-1">{config.description}</p>
          </div>
        </label>
        <span className="font-bold text-lg text-gray-700 w-12 text-right">{value}</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          id={config.id}
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </div>
  );
};

export default OrganismControl;
