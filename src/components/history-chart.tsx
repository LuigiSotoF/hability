"use client"

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type EChartsOption = echarts.EChartsOption;

export const HistoryChart = () => {
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
          // legend: {
          //   data: ['Actividad 2023', 'Actividad 2024'],
          //   top: 30
          // },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Actividad 2023',
              type: 'bar',
              data: [
                2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
              ],
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
            },
            {
              name: 'Actividad 2024',
              type: 'bar',
              data: [
                2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
              ],
              itemStyle: {
                color: '#DFE1E7' // Verde
              },
              markPoint: {
                data: [
                  { name: 'Máximo', value: 182.2, xAxis: 7, yAxis: 183 },
                  { name: 'Mínimo', value: 2.3, xAxis: 11, yAxis: 3 }
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
  }, []);

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