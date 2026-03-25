import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../../shared/sidebar/sidebar';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-dashborad-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboradLayout {}
