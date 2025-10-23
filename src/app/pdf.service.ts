import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Property } from '../app/models/property';
import { Seguimiento } from '../app/models/seguimiento';
import { Cliente } from './models/cliente';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  async generateProforma(property: Property) {
    const doc = new jsPDF();

    // 👉 Cargar logo
    const logoBase64 = await this.getImageAsBase64('assets/imagenes/logoFenix5.png');
    doc.addImage(logoBase64, 'PNG', 10, 10, 50, 20);

    // 👉 Título centrado
    doc.setFontSize(18);
    doc.text('Proforma de Propiedad', 125, 20, { align: 'center' });

    // 👉 Marco general
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);

    // 👉 Imagen principal a la izquierda (si existe)
    let yContent = 40;
    if (Array.isArray(property.imagenes) && property.imagenes.length > 0) {
      const mainImage = await this.loadImageAsBase64(property.imagenes[0]);
      doc.addImage(mainImage, 'JPEG', 10, yContent, 80, 50);
    }
    
    // 👉 Información a la derecha
    const infoX = 120;
    let infoY = yContent;

    doc.setFontSize(12);
    doc.text(`Tipo de propiedad: ${property.TipoPropiedad}`, infoX, infoY); infoY += 10;
    doc.text(`Estado: ${property.Estado}`, infoX, infoY); infoY += 10;
    doc.text(`Precio de venta: $${property.Precio_Venta}`, infoX, infoY); infoY += 10;
    doc.text(`Dirección: ${property.Direccion_Sector}`, infoX, infoY); infoY += 10;
    doc.text(`Habitaciones: ${property.HAB}`, infoX, infoY); infoY += 10;
    doc.text(`Baños: ${property.BNO}`, infoX, infoY); infoY += 10;
    doc.text(`Área construida: ${property.AreaCons ?? 'N/A'} m²`, infoX, infoY); infoY += 10;
    doc.text(`Área total: ${property.AreaTerreno ?? 'N/A'} m²`, infoX, infoY); infoY += 10;
    doc.text(`Parqueaderos: ${property.GRJ ?? 'N/A'}`, infoX, infoY);

    // 👉 Galería 2x2 debajo
   
    const imagesToShow = property.imagenes?.slice(1, 5) || [];


    const marginLeft = 25;   // margen izquierdo más generoso
const spacingX = 80;     // espacio horizontal entre columnas
const imageWidth = 60;
const imageHeight = 40;
const galleryStartY = 150;

for (let i = 0; i < imagesToShow.length; i++) {
  const img = await this.loadImageAsBase64(imagesToShow[i]);

  const x = marginLeft + (i % 2) * spacingX; // 25 o 105
  const y = galleryStartY + Math.floor(i / 2) * (imageHeight + 10); // 150, 200, etc.

  doc.addImage(img, 'JPEG', x, y, imageWidth, imageHeight);
}


    // 👉 Guardar
    doc.save(`${property.TipoPropiedad}-${property.Direccion_Sector}.pdf`);
  }


  generarListadoPropiedades(properties: Property[], tipo: string) {
    const doc = new jsPDF({ orientation: 'landscape' });
    const titulo = tipo === 'venta' ? 'Listado de Propiedades en Venta' : 'Listado de Propiedades en Arriendo';
  
    doc.setFontSize(16);
    doc.text(titulo, 14, 20);
  
    const columnas = [
      { header: 'Código', dataKey: 'IPD' },
      { header: 'Tipo', dataKey: 'TipoPropiedad' },
      { header: 'Estado', dataKey: 'Estado' },
      { header: 'Precio', dataKey: 'Precio_Venta' },
      { header: 'Dirección', dataKey: 'Direccion_Sector' },
      { header: 'Habitaciones', dataKey: 'HAB' },
      { header: 'Baños', dataKey: 'BNO' },
      { header: 'Garage', dataKey: 'GRJ' },
      { header: 'Área (m²)', dataKey: 'AreaCons' },
      { header: 'Amoblado', dataKey: 'Amoblado' },
      { header: 'Encargado', dataKey: 'Encargado' },
      { header: 'Imágenes', dataKey: 'TieneImagen' },
    ];
  
    // Agrupar propiedades por tipo
    const propiedadesPorTipo = new Map<string, Property[]>();
    properties.forEach(p => {
      const tipoProp = (p.TipoPropiedad || 'Otro').trim();
      if (!propiedadesPorTipo.has(tipoProp)) {
        propiedadesPorTipo.set(tipoProp, []);
      }
      propiedadesPorTipo.get(tipoProp)?.push(p);
    });
  
    let currentY = 30;
  
    propiedadesPorTipo.forEach((props, tipoProp) => {
      // Ordenar por código IPD ascendente
      const ordenadas = props.slice().sort((a, b) => {
        const codA = a.IPD?.toUpperCase().replace(/[^\d]/g, '') || '0';
        const codB = b.IPD?.toUpperCase().replace(/[^\d]/g, '') || '0';
        return parseInt(codA) - parseInt(codB);
      });
  
      doc.setFontSize(13);
      doc.text(`Tipo de Propiedad: ${tipoProp}`, 14, currentY);
      currentY += 6;
  
      const filas: Record<string, string>[] = ordenadas.map(p => ({
        IPD: p.IPD || '',
        TipoPropiedad: p.TipoPropiedad || '',
        Estado: p.Estado || '',
        Precio_Venta: `$${p.Precio_Venta}` || '',
        Direccion_Sector: p.Direccion_Sector || '',
        HAB: String(p.HAB || ''),
        BNO: String(p.BNO || ''),
        GRJ: p.GRJ || '',
        AreaCons: String(p.AreaCons || ''),
        Amoblado: p.Amoblado || '',
        Encargado: p.Encargado || '',
        TieneImagen: p.imagenes && p.imagenes.length > 0 ? 'Sí' : 'No',
      }));
  
      autoTable(doc, {
        startY: currentY,
        head: [columnas.map(c => c.header)],
        body: filas.map(row => columnas.map(c => row[c.dataKey] ?? '')),
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: 255,
          fontStyle: 'bold',
        },
        didDrawPage: data => {
          currentY = (data.cursor?.y ?? currentY) + 10;
        }
      });
  
      currentY += 10; // Separación entre tablas
    });
  
    doc.save(`Listado_${tipo}.pdf`);
  }
  
  
  
  



generarListadoSeguimientos(seguimientos: Seguimiento[], tipo: string, clientes: Cliente[]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const titulo = tipo === 'venta' ? 'Seguimientos de Venta' : 'Seguimientos de Renta';

  doc.setFontSize(16);
  doc.text(titulo, 14, 20);

  const columnas = [
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Propiedad', dataKey: 'propiedad' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Observaciones', dataKey: 'observaciones' },
  ];

  const filas = seguimientos.map(s => {
    const cliente = clientes.find(c => c.id === s.clienteId);
    return {
      cliente: cliente?.nombre || 'Desconocido',
      propiedad: s.propiedadCodigoIPD,
      estado: s.estado,
      fecha: s.fecha,
      observaciones: s.observaciones || '',
    };
  });

  autoTable(doc, {
    startY: 30,
    head: [columnas.map(c => c.header)],
    body: (filas as Record<string, any>[]).map(row => columnas.map(c => row[c.dataKey] ?? '')),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [40, 167, 69], // verde Bootstrap
      textColor: 255,
      fontStyle: 'bold',
    }
  });

  doc.save(`Seguimientos_${tipo}.pdf`);
}

  
  // Convertir URL de imagen a base64
  private async loadImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Alternativa para imágenes locales (logo en /assets)
  private async getImageAsBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  
}
