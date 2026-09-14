import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

export interface SearchableOption {
  label: string;
  value: string | number;
}

interface FormSearchableSelectProps {
  label?: string;
  error?: string;
  options: SearchableOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

export const FormSearchableSelect: React.FC<FormSearchableSelectProps> = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
}) => {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="w-full flex flex-col gap-1 relative">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Combobox value={selectedOption} onChange={(opt) => opt && onChange(opt.value)}>
        <div className="relative">
          <Combobox.Input
            className={`w-full px-3 py-2 border rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              error ? 'border-red-500' : 'border-gray-300 focus:border-purple-600'
            }`}
            displayValue={(opt: SearchableOption) => opt?.label || ''}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-gray-400" />
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              Sin resultados.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <Combobox.Option
                key={opt.value}
                value={opt}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-purple-50 text-purple-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {opt.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};