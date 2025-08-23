import React from 'react'

export default function Settings() {
  return (
    <div className='flex flex-col gap-4 items-center justify-center'>
      <h1 className='text-2xl font-bold'>Configuración</h1>
      <div className='flex flex-col gap-2'>
        <h2 className='text-lg font-bold'>Configuración de la cuenta</h2>
        <p className='text-sm text-gray-500'>Configura tu cuenta para personalizar tu experiencia.</p>
      </div>
    </div>
  )
}