import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';


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
      path: 'home',
      component: HomeComponent,
    },

  
  
  ];