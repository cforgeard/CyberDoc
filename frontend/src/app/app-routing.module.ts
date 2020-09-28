import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesPageComponent } from './pages/files-page/files-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';

const routes: Routes = [
  { path: 'files/:dirID', component: FilesPageComponent, canActivate: [AuthGuard] },
  { path: 'files', component: FilesPageComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'files', pathMatch: 'full'},
  { path: 'logout', component: LogoutPageComponent },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
