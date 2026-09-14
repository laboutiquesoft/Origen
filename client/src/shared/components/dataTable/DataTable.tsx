// src/shared/components/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

// Definición de las columnas
export interface Column<T> {
    key: string;
    header: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
}

export interface Action<T> {
    icon: IconDefinition;
    title: string;
    variant: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
    onClick: (item: T) => void;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    emptyMessage?: string;
    initialPageSize?: number;
}

function DataTable<T>({
    data,
    columns,
    actions,
    keyExtractor,
    isLoading = false,
    emptyMessage = 'No se encontraron registros.',
    initialPageSize = 10,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);

    // Cálculos de paginación
    const totalRecords = data.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    // Resetear a la página 1 cuando el pageSize o los datos cambian externamente
    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // Subconjunto de datos visible
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    // Mapeo de colores para los botones de acción estilo badge
    const actionStyles: Record<Action<T>['variant'], string> = {
        emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        red: 'bg-red-100 text-red-700 hover:bg-red-200',
        purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Topbar de Paginación */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Mostrar</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-xs text-gray-600">registros</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    Mostrando {startRecord} a {endRecord} de {totalRecords} registros
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Cabecera usando el Gradiente / Color Principal del Sistema */}
                        <tr className="bg-main-gradient text-white text-xs font-semibold uppercase tracking-wider">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th className="p-3 text-center">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="p-8 text-center text-gray-400"
                                >
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Cargando datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="p-8 text-center text-gray-400 font-medium"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    /* Hover azul suave requerido */
                                    className="hover:bg-blue-50/60 transition-colors duration-150"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : (item as Record<string, any>)[col.key]}
                                        </td>
                                    ))}

                                    {/* Botones de acción dinámicos */}
                                    {actions && actions.length > 0 && (
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                {actions.map((act, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => act.onClick(item)}
                                                        title={act.title}
                                                        className={`p-1.5 rounded transition-all duration-200 ${actionStyles[act.variant]}`}
                                                    >
                                                        <FontAwesomeIcon icon={act.icon} className="w-3.5 h-3.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controls de Paginación Inferior */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                    Anterior
                </button>

                <span className="text-xs text-gray-600 font-medium">
                    Página <span className="font-bold text-gray-800">{currentPage}</span> de <span className="font-bold text-gray-800">{totalPages}</span>
                </span>

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages || isLoading}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}

export { DataTable };