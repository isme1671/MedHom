export interface Usuario { id: number; nombre: string; email: string; passHash: string; }

export interface Paciente {
  id: number; nombre: string; cedula: string; fechaNac: string; telefono: string;
  tipoSangre: string; alergias: string; antecedentes: string; foto?: string;
}

export interface Medico { id: number; nombre: string; especialidad: string; telefono: string; }

export interface Cita {
  id: number; pacienteId: number; medicoId: number; fecha: string; motivo: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

export interface Consulta {
  id: number; pacienteId: number; medicoId: number; fecha: string; diagnostico: string; notas: string;
}

export interface Medicamento { nombre: string; dosis: string; frecuencia: string; }

export interface Receta {
  id: number; pacienteId: number; medicoId: number; fecha: string; medicamentos: Medicamento[];
}

export interface Factura {
    id: number; pacienteId: number; fecha: string; concepto: string; monto: number; pagada: boolean;
  metodoPago?: string; fechaPago?: string;
}