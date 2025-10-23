import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { AuthGuard } from './auth.guard'; 
import { MantenimientoComponent } from './pages/mantenimiento/mantenimiento.component';
import { PropiedadComponent } from './pages/propiedad/propiedad.component';
import { DetallePropiedadComponent } from './pages/detalle-propiedad/detalle-propiedad.component';
import { AcercadeComponent } from './pages/acercade/acercade.component';
import { SeguimientoComponent } from './pages/seguimiento/seguimiento.component';


export const routes: Routes = [
    {
      path: '',
      component: HomeComponent,
    },

    {
      path: 'catalogo',
      component: CatalogoComponent,
    },

    {
      path: 'detalle/:id',
      component: DetallePropiedadComponent,
    },

    {
      path: 'home',
      component: HomeComponent,
    },

    {
      path: 'acercade',
      component: AcercadeComponent,
    },

    {
      path: 'seguimiento',
      component: SeguimientoComponent,
      canActivate: [AuthGuard] ,
      
    },


    { path: 'mantenimiento',
      component: MantenimientoComponent, 
      canActivate: [AuthGuard] },

      { path: 'propiedad/:id',
      component: PropiedadComponent, 
      canActivate: [AuthGuard] },

      { 
        path: 'propiedad', 
        component: PropiedadComponent, 
        canActivate: [AuthGuard] 
      }
      

  ];