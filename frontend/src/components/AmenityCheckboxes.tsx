"use client";

const AMENIDADES = [
  "Piscina",
  "Jardín",
  "Seguridad 24h",
  "Gimnasio",
  "Área de BBQ",
  "Salón comunal",
  "Área de juegos infantiles",
  "Cancha deportiva",
  "Jacuzzi",
  "Terraza",
  "Cuarto de servicio",
  "Bodega",
];

interface AmenityCheckboxesProps {
  selected: string[];
  onChange: (amenidades: string[]) => void;
}

export default function AmenityCheckboxes({
  selected,
  onChange,
}: AmenityCheckboxesProps) {
  const toggle = (amenidad: string) => {
    if (selected.includes(amenidad)) {
      onChange(selected.filter((a) => a !== amenidad));
    } else {
      onChange([...selected, amenidad]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {AMENIDADES.map((amenidad) => (
        <label
          key={amenidad}
          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected.includes(amenidad)
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(amenidad)}
            onChange={() => toggle(amenidad)}
            className="rounded text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">{amenidad}</span>
        </label>
      ))}
    </div>
  );
}
