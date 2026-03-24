import { Component } from '@angular/core';

import { Sidebar } from '../../shared/sidebar/sidebar';
import { Header } from '../../shared/header/header';
import { RouterOutlet } from '../../../../node_modules/@angular/router/types/_router_module-chunk';

@Component({
  selector: 'app-dashborad-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboradLayout {}
