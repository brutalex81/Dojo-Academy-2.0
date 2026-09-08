export function SheetTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <section className="space-y-3">
      <div className="bg-accent px-4 py-3 text-center text-sm font-semibold tracking-widest text-accent-fg uppercase">
        {title}
      </div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs tracking-widest text-subtle uppercase">
            <tr>
              {headers.map((h) => (
                <th key={h} className="border-b border-line px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line/80">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2.5">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
