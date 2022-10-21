import { Component, Input } from '@angular/core';
import { Role } from '../../models/role';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent {
  @Input() roles: Role[];
  displayedColumns = ['name', 'namespace', 'status'];
}
