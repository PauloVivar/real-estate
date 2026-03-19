import PropertyForm from "@/components/PropertyForm";

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Nueva Publicación de Propiedad
        </h2>
        <p className="text-gray-500 mt-1">
          Completa los datos y genera contenido profesional con IA
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
