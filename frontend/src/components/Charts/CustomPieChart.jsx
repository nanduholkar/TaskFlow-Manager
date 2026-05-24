import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import CustomeTooltip from '../Charts/CustomeTooltip.jsx'
import CustomeLegend from '../Charts/CustomeLegend.jsx'


const CustomPieChart = ({ colors, data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>

        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >

          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}

        </Pie>

        <Tooltip content={<CustomeTooltip/>}/>
        <Legend content={<CustomeLegend/>} />

      </PieChart>
    </ResponsiveContainer>
  )
}

export default CustomPieChart