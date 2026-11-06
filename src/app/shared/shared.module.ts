import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BadgePipe, FcfaPipe, FichierPipe, LibellePipe, NomPipe, TraductionPipe } from './pipes/pipes';
import { NotationFormComponent } from './components/notation-form.component';
import { MissionsComponent } from './components/missions.component';
import { ProjetsOuvertsComponent } from './components/projets-ouverts.component';
import { ProfilFormComponent } from './components/profil-form.component';
import { IconeComponent } from './components/icone.component';

/** Elements partages par tous les modules de profil : pipes (traduction, FCFA...) et composants communs. */
const DECLARATIONS = [
  TraductionPipe, FcfaPipe, FichierPipe, NomPipe, LibellePipe, BadgePipe,
  NotationFormComponent, MissionsComponent, ProjetsOuvertsComponent, ProfilFormComponent, IconeComponent
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...DECLARATIONS]
})
export class SharedModule {}
