'use client';

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { icons } from 'lucide-react';

interface IconSelectorProps {
  value?: string;
  onSelectIcon: (iconName: string) => void;
  onClose?: () => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ value, onSelectIcon, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Get all icon names from lucide-react using the icons object
  const allIconNames = useMemo(() => {
    const iconNames = Object.keys(icons);
    console.log('Total icons found:', iconNames.length);
    console.log('Sample icons:', iconNames.slice(0, 20));
    return iconNames;
  }, []);

  // Filter icons based on search term
  const filteredIcons = allIconNames.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Filtered icons:', filteredIcons.length);

  const handleIconClick = (iconName: string) => {
    onSelectIcon(iconName);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-3xl w-full max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Icono</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar iconos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            autoFocus
          />
        </div>
        {value && (
          <div className="mt-2 text-sm text-gray-600">
            Icono actual: <span className="font-semibold text-cyan-700">{value}</span>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          {filteredIcons.length} iconos encontrados
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {filteredIcons.map((iconName) => {
            const IconComponent = icons[iconName as keyof typeof icons];
            const isSelected = value === iconName;

            return (
              <div
                key={iconName}
                onClick={() => handleIconClick(iconName)}
                className={`
                  cursor-pointer text-center border rounded-lg p-3 transition-all
                  hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md
                  ${isSelected ? 'border-cyan-500 bg-cyan-100 shadow-md' : 'border-gray-200'}
                `}
                title={iconName}
              >
                <div className="flex items-center justify-center mb-1">
                  <IconComponent size={24} className={isSelected ? 'text-cyan-700' : 'text-gray-700'} />
                </div>
                <p className="text-[0.65rem] text-gray-600 truncate leading-tight">
                  {iconName}
                </p>
              </div>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron iconos</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconSelector;
