import { Component, OnInit } from '@angular/core';
import { SeguimientoService } from '../../services/seguimiento.service';
import { Seguimiento } from '../../models/seguimiento';
import { Property } from '../../models/property';
import { PropertyService } from '../../services/property.service';
import { Cliente } from '../../models/cliente';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../pdf.service';

@Component({
  selector: 'app-seguimiento',
  standalone: true,  // Asegúrate de usar esto si trabajas con Angular standalone
  imports: [FormsModule,CommonModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css']
})
export class SeguimientoComponent implements OnInit {

  seguimiento: Seguimiento = {
    clienteId: '',
    propiedadCodigoIPD: '',
    tipo: 'venta',
    estado: 'contactado',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  };

  // ✅ Lista de clientes y codigos
  clientes: Cliente[] = [];
  codigosIPD: string[] = [];

  // ✅ Nuevo cliente temporal
  nuevoCliente: Cliente = {
    nombre: '',
    correo: '',
    telefono: ''
  };

  seguimientos: Seguimiento[] = [];
  tipoFiltro: 'venta' | 'renta' | 'pendiente'= 'venta';

  propiedades: Property[] = []; 
  mostrarFormularioCliente = false;

  constructor(private seguimientoService: SeguimientoService, private pdfService:PdfService, private propertyService:PropertyService) {}

  ngOnInit() {
    this.seguimientoService.obtenerClientes().subscribe(c => this.clientes = c);
    this.seguimientoService.obtenerTodosLosCodigosIPD().then(codigos => this.codigosIPD = codigos);
    this.seguimientoService.obtenerSeguimientos().subscribe(s => this.seguimientos = s);
    this.propertyService.getPropiedades().subscribe(p => this.propiedades = p);
  }

  obtenerImagenPropiedad(ipd: string): string {
    const prop = this.propiedades.find(p => p.IPD === ipd);
    return prop?.imagenes?.[0] || 'assets/imagenes/default.jpg';
  }


  crearNuevoCliente() {
    if (!this.nuevoCliente.nombre) {
      alert('Nombre es obligatorio.');
      return;
    }

    this.seguimientoService.crearCliente(this.nuevoCliente)
      .then(() => {
        alert('Cliente creado con éxito.');
        this.mostrarFormularioCliente = false;
        this.nuevoCliente = { nombre: '', correo: '', telefono: '' };

        // Recargar clientes y asignar automáticamente el último
        this.seguimientoService.obtenerClientes().subscribe(c => {
          this.clientes = c;
          const ultimo = c[c.length - 1];
          this.seguimiento.clienteId = ultimo.id!;
        });
      })
      .catch(err => console.error('Error al crear cliente:', err));
  }

  seguimientosFiltrados(): Seguimiento[] {
    if (this.tipoFiltro === 'pendiente') {
      return this.seguimientos.filter(s => s.estado === 'visita agendada');
    }
    return this.seguimientos.filter(s => s.tipo === this.tipoFiltro);
  }


  
  eliminarSeguimiento(id?: string) {
    if (!id) {
      console.warn('ID no válido para eliminar');
      return;
    }
  
    if (confirm('¿Estás seguro de eliminar este seguimiento?')) {
      this.seguimientoService.eliminarSeguimiento(id)
        .then(() => alert('Seguimiento eliminado.'))
        .catch(err => console.error('Error al eliminar:', err));
    }
  }
  

  generarPDF(tipo: 'venta' | 'renta') {
    const datos = this.seguimientos.filter(s => s.tipo === tipo);
    this.pdfService.generarListadoSeguimientos(datos, tipo, this.clientes);
  }
  
  
  editarSeguimiento(s: Seguimiento) {
    this.seguimiento = { ...s }; // Carga en el formulario izquierdo
  }
  
  
  
  obtenerNombreCliente(clienteId: string): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Desconocido';
  }

  obtenerNumeroCliente(clienteId: string): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.telefono : 'Desconocido';
  }

  guardarSeguimiento() {
    const { clienteId, propiedadCodigoIPD, tipo } = this.seguimiento;
  
    if (!clienteId || !propiedadCodigoIPD) {
      alert('Seleccione cliente y código IPD.');
      return;
    }
  
    // 1. Verificar si ya existe un seguimiento con esos datos
    const existente = this.seguimientos.find(s =>
      s.clienteId === clienteId &&
      s.propiedadCodigoIPD === propiedadCodigoIPD &&
      s.tipo === tipo
    );
  
    if (existente) {
      // 2. Actualizar en lugar de crear uno nuevo
      this.seguimientoService.actualizarSeguimiento(existente.id!, this.seguimiento)
        .then(() => {
          alert('Seguimiento actualizado con éxito.');
          this.resetFormulario();
        })
        .catch(err => console.error('Error al actualizar seguimiento:', err));
    } else {
      // 3. Crear nuevo seguimiento
      this.seguimientoService.crearSeguimiento(this.seguimiento)
        .then(() => {
          alert('Seguimiento guardado con éxito.');
          this.resetFormulario();
        })
        .catch(err => console.error('Error al guardar seguimiento:', err));
    }
  }
  

  resetFormulario() {
    this.seguimiento = {
      clienteId: '',
      propiedadCodigoIPD: '',
      tipo: 'venta',
      estado: 'contactado',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    };
  }
}
