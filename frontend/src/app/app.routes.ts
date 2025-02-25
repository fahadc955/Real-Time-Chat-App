import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: ':id', component: ChatComponent }, // Dynamic ID route
];
