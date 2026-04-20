import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLORS } from '../../utils/format';

export default function CategoryChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.category} fill={CATEGORY_COLORS[d.category] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
