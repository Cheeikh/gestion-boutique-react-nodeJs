import React from 'react';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import Filters from './Filters';
import SessionCalendar from './SessionCalendar';
import Layout from './Layout';

interface FilterValues {
  period?: string;
  date?: string;
  status?: string;
}

const CourseList: React.FC = () => {
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'course_name',
        header: 'Nom du cours',
        accessorKey: 'course_name',
      },
      {
        id: 'module',
        header: 'Module',
        accessorKey: 'module_name',
      },
      {
        id: 'semester',
        header: 'Semestre',
        accessorKey: 'semester_name',
      },
      {
        id: 'class',
        header: 'Classe',
        accessorKey: 'class_name',
      },
      {
        id: 'program',
        header: 'Programme',
        accessorKey: 'program',
      },
      {
        id: 'level',
        header: 'Niveau',
        accessorKey: 'level',
      },
    ],
    []
  );

  const [filterValues, setFilterValues] = React.useState<FilterValues>({});
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);

  const handleFilter = (values: FilterValues) => {
    setFilterValues(values);
    setPageIndex(0);
  };

  const {
    getHeaderGroups,
    getRowModel,
    setPageIndex,
    getState,
    getCanPreviousPage,
    getPageCount,
    getCanNextPage,
    nextPage,
    previousPage,
    refineCore: { isLoading, isError },
  } = useTable({
    columns,
    refineCoreProps: {
      resource: 'courses',
      pagination: {
        mode: 'server',
        pageSize: 5,
      },
      filters: {
        permanent: [
          {
            field: 'period',
            operator: 'eq',
            value: filterValues.period,
          },
          {
            field: 'date',
            operator: 'eq',
            value: filterValues.date,
          },
          {
            field: 'status',
            operator: 'eq',
            value: filterValues.status,
          },
        ],
      },
    },
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (isError) {
    return <div>Erreur lors du chargement des cours</div>;
  }

  return (
    <Layout>
      <Filters onFilter={handleFilter} />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {getRowModel().rows.length > 0 ? (
            getRowModel().rows.map((row: any) => (
              <tr key={row.id} onClick={() => setSelectedCourseId(row.original.id)} className="cursor-pointer hover:bg-gray-100">
                {row.getVisibleCells().map((cell: any) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cell.getValue() as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                Aucun cours n'a été programmé
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-between items-center p-4">
        <button onClick={() => previousPage()} disabled={!getCanPreviousPage()} className="px-4 py-2 bg-purple-600 text-white rounded">
          Précédent
        </button>
        <button onClick={() => nextPage()} disabled={!getCanNextPage()} className="px-4 py-2 bg-purple-600 text-white rounded">
          Suivant
        </button>
      </div>
      {selectedCourseId && <SessionCalendar courseId={selectedCourseId} filterValues={filterValues}/>}
    </Layout>
  );
};

export default CourseList;
