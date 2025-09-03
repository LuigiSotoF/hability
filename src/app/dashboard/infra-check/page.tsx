import { InfraCheckTable } from "@/components/infra-check-table";

export default function InfraCheckPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verificación de Infraestructura</h1>
        <p className="text-muted-foreground">
          Revisa el estado y análisis de las propiedades registradas en el sistema.
        </p>
      </div>

      <InfraCheckTable />
    </div>
  );
}
