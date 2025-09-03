"use client"

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type EChartsOption = echarts.EChartsOption;

type HistoryChartProps = {
  labels?: string[]
  values?: number[]
}

export const HistoryChart = ({ labels = [], values = [] }: HistoryChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      if (chartRef.current) {
        chartInstance.current = echarts.init(chartRef.current);

        const option: EChartsOption = {
          title: {
            text: 'Historial de Actividad',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: labels.length ? labels : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Chats',
              type: 'bar',
              data: values.length ? values : [2, 5, 7, 10, 12, 8, 6, 9, 4, 3, 5, 2],
              itemStyle: {
                color: '#1482F8'
              },
              markPoint: {
                data: [
                  { type: 'max', name: 'Máximo' },
                  { type: 'min', name: 'Mínimo' }
                ]
              },
              markLine: {
                data: [{ type: 'average', name: 'Promedio' }]
              }
            }
          ]
        };

        chartInstance.current.setOption(option);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [labels, values]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gráfica de Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={chartRef}
          className="w-full h-[450px]"
          style={{ minHeight: '450px' }}
        />
      </CardContent>
    </Card>
  );
};