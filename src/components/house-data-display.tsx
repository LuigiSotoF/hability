"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { House } from "@/lib/types/house.types";
import { getHousesAction } from "@/app/actions/get-houses.action";

interface HouseDataDisplayProps {
  className?: string;
}

export function HouseDataDisplay({ className }: HouseDataDisplayProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getHousesAction({ page: 1, limit: 50 });
      if (result.isOk && result.data) {
        setHouses(result.data);
      }
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-[#007524]/17 text-[#007524]";
    if (score >= 6) return "bg-[#feb204]/17 text-[#feb204]";
    if (score >= 4) return "bg-[#F86B14]/17 text-[#F86B14]";
    return "bg-[#D01A1A]/17 text-[#D01A1A]";
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Propiedades Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <Card key={house.id} className="overflow-hidden border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{house.address}</h3>
                      <p className="text-sm text-gray-500">{house.city}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Precio:</span>
                        <div className="font-medium">{formatPrice(house.around_price_estimated)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Área:</span>
                        <div className="font-medium">{house.mts_estimated} m²</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Habitaciones:</span>
                        <div className="font-medium">{house.bethrooms}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Estrato:</span>
                        <div className="font-medium">{house.stratum}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Seguridad</span>
                        <div className={`px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(house.security_score)}`}>
                          {house.security_score}/10
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Inversión</span>
                        <div className={`px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(house.investment_score)}`}>
                          {house.investment_score}/10
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Infraestructura</span>
                        <div className={`px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(house.infracstrucute_score)}`}>
                          {house.infracstrucute_score}/10
                        </div>
                      </div>
                    </div>

                    {house.recent_seismic_events && (
                      <div className="text-sm text-[#D01A1A] bg-[#D01A1A]/17 px-2 py-1 rounded-md">
                        ⚠️ Eventos sísmicos recientes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
