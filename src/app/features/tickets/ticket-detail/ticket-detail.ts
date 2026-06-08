import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CrudMode } from '../../../shared/enums/crud.enum';
import { TitleService } from '../../../core/services/title.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../../shared/enums/department.enum';
import { TicketPriority, TicketStatus } from '../../../shared/enums/tickets.enum';
import { CommonModule } from '@angular/common';
import { TicketPriorityPipe } from '../../../shared/pipes/ticket-priority-pipe';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../shared/enums/user-roles.enum';
import { ManagerService } from '../../../core/services/manager.service';
import { CustomerService } from '../../../core/services/customer.service';
import { MatIconModule } from '@angular/material/icon';
import { CustomerPipe } from '../../../shared/pipes/customer-pipe';
import { ManagerPipe } from '../../../shared/pipes/manager-pipe';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TicketPriorityPipe,
    MatIconModule,
    CustomerPipe,
    ManagerPipe,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export class TicketDetail implements OnInit {
  crudMode: CrudMode = CrudMode.READ;
  CrudMode = CrudMode;

  UserRole = UserRole;

  Department = Department;
  departmentOptions = Object.values(this.Department);
  selectedDepartment = signal<string>(Department.CUSTOMER_SUPPORT);

  Priority = TicketPriority;
  priorityOptions = Object.values(this.Priority).filter((value) => typeof value === 'number');

  private titleService = inject(TitleService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private managerService = inject(ManagerService);
  private customerService = inject(CustomerService);

  customerList = this.customerService.getCustomerList$();

  managerList = this.managerService.getManagerList$();
  managersRelatedToSelectedDepartment = computed(() =>
    this.managerList().filter((manager) => manager.department === this.selectedDepartment()),
  );

  currentUser = this.userService.getCurrentUser$();

  detailsForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: [TicketPriority.LOW, Validators.required],
    department: [Department.CUSTOMER_SUPPORT, Validators.required],
    assignedTo: [''],
    status: [TicketStatus.OPEN],
    customerId: ['', Validators.required],
    assignedManagerId: [''],
  });

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.crudMode = data['mode'];
      this.initByMode();
    });
  }

  initByMode() {
    this.setHeaderValues();

    // if (this.crudMode === CrudMode.CREATE) {
    //   this.detailsForm.reset();
    //   this.detailsForm.enable();
    //   return;
    // }

    // const managerId = this.route.snapshot.paramMap.get('managerId') as string;

    // this.managerService.getManager(managerId).subscribe((res) => {
    //   this.selectedManager = res;
    //   this.detailsForm.patchValue(res);

    //   if (this.crudMode === CrudMode.READ) {
    //     this.detailsForm.disable();
    //   } else {
    //     this.detailsForm.enable();
    //   }
    // });
  }

  setHeaderValues() {
    if (this.crudMode === CrudMode.CREATE) {
      this.titleService.setTitle('New Ticket');
    } else if (this.crudMode === CrudMode.EDIT) {
      this.titleService.setTitle('Update Ticket');
    } else {
      this.titleService.setTitle('Ticket Details');
    }

    this.titleService.setHasBackButton(true);
    this.titleService.setBackButtonUrl(['/', 'tickets']);
  }

  onDepartmentChange(event: Event) {
    this.detailsForm.controls.assignedManagerId.reset();
    const department = (event.target as HTMLSelectElement).value;
    this.selectedDepartment.set(department);
  }
}
