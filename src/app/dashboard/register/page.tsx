"use client"

import { DateFilterSelector, DateFilter } from '@/components/date-filter-selector'
import { RegisterDataTable } from '@/components/register-data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useState } from 'react'

export default function Register() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentFilter, setCurrentFilter] = useState<DateFilter>("all")
  const handleFilterChange = (filter: DateFilter, start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
    setCurrentFilter(filter)
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-semibold text-gray-900'>Registro</h1>
        <DateFilterSelector onFilterChange={handleFilterChange} defaultValue={currentFilter} />
      </div>
      <div>
        <Card>
          <CardContent>
            <RegisterDataTable startDate={startDate} endDate={endDate} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
