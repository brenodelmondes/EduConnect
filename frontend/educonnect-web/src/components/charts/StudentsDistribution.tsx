import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

type Item = { name: string; value: number };

export function StudentsDistributionChart({ data }: { data: Item[] }) {
  // cores fixas só para demo (depois dá para amarrar no tema)
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            stroke="transparent"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: any, _name: any, ctx: any) => {
              const course = ctx?.payload?.name ?? "Curso";
              return [`${value} alunos`, course];
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
