"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Camera, 
  Trash2, 
  Save, 
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

export default function AccountSettings() {
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@hability.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    role: 'Admin'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Resetear formulario
    setFormData({
      name: 'John Doe',
      email: 'john.doe@hability.com',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      role: 'Admin'
    })
    setIsEditing(false)
  }

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className='text-3xl font-semibold text-gray-900 flex items-center gap-3'>
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración de Cuenta
          </h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias de seguridad</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información del Perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5 text-blue-600" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre Completo
                  </label>
                  <Input 
                    placeholder='Tu nombre completo' 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo Electrónico
                  </label>
                  <Input 
                    placeholder='tu@email.com' 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    type="email"
                    className="transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rol de Usuario
                </label>
                <Input 
                  value={formData.role}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-green-600" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Input 
                    placeholder='••••••••' 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    disabled={!isEditing}
                    className="pr-10 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!isEditing}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Input 
                      placeholder='••••••••' 
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      disabled={!isEditing}
                      className="pr-10 transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={!isEditing}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Contraseña
                  </label>
                  <Input 
                    placeholder='••••••••' 
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={!isEditing}
                    className="transition-all duration-200"
                  />
                </div>
              </div>
              
              {formData.newPassword && formData.confirmPassword && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  formData.newPassword === formData.confirmPassword 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {formData.newPassword === formData.confirmPassword ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {formData.newPassword === formData.confirmPassword 
                      ? 'Las contraseñas coinciden' 
                      : 'Las contraseñas no coinciden'
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Avatar y Acciones */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Camera className="w-5 h-5 text-purple-600" />
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src="/assets/images/account-image.jpg" alt="Foto de perfil" />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Camera className="w-4 h-4" />
                      Cambiar Foto
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Foto
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-blue-600" />
                Estado de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">Verificación de Email</span>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verificado</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">Autenticación 2FA</span>
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Pendiente</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">Último Acceso</span>
                <span className="text-sm text-gray-600">Hace 2 horas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}