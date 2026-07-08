import React, { HTMLAttributes, TableHTMLAttributes } from 'react';

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20 backdrop-blur-sm">
      <table className={`w-full border-collapse text-left text-sm text-slate-300 ${className}`} {...props} />
    </div>
  );
};

export const TableHeader: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => {
  return <thead className={`border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider ${className}`} {...props} />;
};

export const TableBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => {
  return <tbody className={`divide-y divide-slate-800/60 bg-transparent ${className}`} {...props} />;
};

export const TableRow: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`transition-colors duration-250 hover:bg-slate-900/30 ${className}`}
      {...props}
    />
  );
};

export const TableHead: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <th
      className={`px-6 py-4 font-semibold text-slate-300 tracking-wider ${className}`}
      {...props}
    />
  );
};

export const TableCell: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <td
      className={`px-6 py-4 align-middle text-slate-300 whitespace-nowrap ${className}`}
      {...props}
    />
  );
};
