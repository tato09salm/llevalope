
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const datosPedidos = [
  { mes: 'Ene', pedidos: 45 },
  { mes: 'Feb', pedidos: 52 },
  { mes: 'Mar', pedidos: 68 },
  { mes: 'Abr', pedidos: 59 },
  { mes: 'May', pedidos: 89 },
  { mes: 'Jun', pedidos: 95 },
  { mes: 'Jul', pedidos: 102 },
  { mes: 'Ago', pedidos: 98 },
  { mes: 'Sep', pedidos: 110 },
  { mes: 'Oct', pedidos: 125 },
  { mes: 'Nov', pedidos: 138 },
  { mes: 'Dic', pedidos: 155 },
];

export default function OrdersChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={datosPedidos} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" stroke="#6b7280" tick={{ fontSize: 12 }} />
        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Bar dataKey="pedidos" radius={[8, 8, 0, 0]}>
          {datosPedidos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="#0f766e" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
