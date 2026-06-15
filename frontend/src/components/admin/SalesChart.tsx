
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

const datosVentas = [
  { mes: 'Ene', ventas: 28000 },
  { mes: 'Feb', ventas: 32500 },
  { mes: 'Mar', ventas: 41000 },
  { mes: 'Abr', ventas: 37000 },
  { mes: 'May', ventas: 45230 },
  { mes: 'Jun', ventas: 48500 },
  { mes: 'Jul', ventas: 52000 },
  { mes: 'Ago', ventas: 49800 },
  { mes: 'Sep', ventas: 55000 },
  { mes: 'Oct', ventas: 61000 },
  { mes: 'Nov', ventas: 68000 },
  { mes: 'Dic', ventas: 75000 },
];

export default function SalesChart() {
  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={datosVentas} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" stroke="#6b7280" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
          }}
          formatter={(value: number) => formatPrecio(value)}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="ventas"
          stroke="#0f766e"
          strokeWidth={3}
          dot={(props) => {
            const { cx, cy, payload } = props;
            return (
              <Dot
                cx={cx}
                cy={cy}
                r={5}
                fill="#0f766e"
                stroke="#fff"
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
