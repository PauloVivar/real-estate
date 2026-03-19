"use client";

interface AgentInfoFieldsProps {
  nombre: string;
  telefono: string;
  email: string;
  onChange: (field: string, value: string) => void;
}

export default function AgentInfoFields({
  nombre,
  telefono,
  email,
  onChange,
}: AgentInfoFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del agente *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onChange("agente_nombre", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => onChange("agente_telefono", e.target.value)}
          placeholder="+593 99 999 9999"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onChange("agente_email", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>
    </div>
  );
}
