import { Component, Input, OnInit } from '@angular/core';
import { Role } from '../../models/role';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  @Input() roles: Role[];
  displayedColumns = ['name', 'namespace'];

  ngOnInit(): void {
  }

}
