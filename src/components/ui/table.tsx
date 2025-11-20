import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

interface TableBodyProps {
  children: React.ReactNode;
}

interface TableCellProps {
  children: React.ReactNode;
}

interface TableHeadProps {
  children: React.ReactNode;
}

interface TableHeaderProps {
  children: React.ReactNode;
}

interface TableRowProps {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <div className="container">
      <table className="w-full border-collapse overflow-hidden shadow-lg">
        {children}
      </table>
    </div>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableCell: React.FC<TableCellProps> = ({ children }) => {
  return (
    <td className="py-4 px-6 bg-white bg-opacity-20 text-white relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-20 z-[-1] opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
    </td>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ children }) => {
  return <thead>{children}</thead>;
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <th className="py-4 px-6 bg-indigo-700 text-left text-white font-semibold">
      {children}
    </th>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children }) => {
  return (
    <tr className="hover:bg-white hover:bg-opacity-30 transition-colors duration-200">
      {children}
    </tr>
  );
};
