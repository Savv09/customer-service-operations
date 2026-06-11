import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CrudMode } from '../../../shared/enums/crud.enum';
import { TitleService } from '../../../core/services/title.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { generateTicketCode } from '../../../core/utils/ticket-code-generator';
import { TicketStatusPipe } from '../../../shared/pipes/ticket-status-pipe';
import { finalize } from 'rxjs';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SnackbarMode } from '../../../shared/enums/snackbarMode.enum';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TicketPriorityPipe,
    MatIconModule,
    CustomerPipe,
    ManagerPipe,
    TicketStatusPipe,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export class TicketDetail implements OnInit {
  crudMode: CrudMode = CrudMode.READ;
  CrudMode = CrudMode;

  UserRole = UserRole;
  isLoading = signal<boolean>(false);

  selectedTicket: Ticket | null = null;

  Department = Department;
  departmentOptions = Object.values(this.Department);
  selectedDepartment = signal<string>(Department.CUSTOMER_SUPPORT);

  ticketPriority = TicketPriority;
  priorityOptions = Object.values(this.ticketPriority).filter((value) => typeof value === 'number');

  ticketSatus = TicketStatus;
  statusOptions = Object.values(this.ticketSatus).filter((value) => typeof value === 'number');

  private titleService = inject(TitleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private managerService = inject(ManagerService);
  private customerService = inject(CustomerService);
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);

  customerList = this.customerService.getCustomerList$();

  managerList = this.managerService.getManagerList$();
  managersRelatedToSelectedDepartment = computed(() => {
    const managerList = this.managerList();
    const department = this.selectedDepartment();
    const selectedManagerId = this.detailsForm?.value?.assignedManagerId;

    const filteredList = department
      ? managerList.filter((manager) => manager.department === department)
      : managerList;

    const selectedStillExists = filteredList.some((manager) => manager.id === selectedManagerId);

    if (!selectedStillExists && selectedManagerId) {
      const selectedManager = managerList.find((manager) => manager.id === selectedManagerId);
      if (selectedManager) {
        return [...filteredList, selectedManager];
      }
    }

    return filteredList;
  });

  currentUser = this.userService.getCurrentUser$();

  detailsForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: [TicketPriority.LOW, Validators.required],
    department: [Department.CUSTOMER_SUPPORT, Validators.required],
    status: [TicketStatus.OPEN, Validators.required],
    customerId: ['', Validators.required],
    assignedManagerId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.route.data.subscribe((data) => {
      this.crudMode = data['mode'];
      this.initByMode();
    });
  }

  initByMode() {
    this.setHeaderValues();

    if (this.crudMode === CrudMode.CREATE) {
      this.detailsForm.reset();
      this.detailsForm.enable();
      this.isLoading.set(false);
      return;
    }

    const ticketId = this.route.snapshot.paramMap.get('ticketId') as string;

    this.ticketService
      .getTicket(ticketId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((res) => {
        this.selectedTicket = res;

        const assignedManagerId = res.assignedManagerId ?? 'none';

        this.detailsForm.patchValue({ ...res, assignedManagerId });

        if (this.crudMode === CrudMode.READ) {
          this.detailsForm.disable();
        } else {
          this.detailsForm.enable();
        }
      });
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

  onSaveTicketsForm() {
    if (!this.detailsForm.valid) return;

    const formValue = this.detailsForm.getRawValue();

    if (this.crudMode === CrudMode.CREATE) {
      const assignedManagerId =
        formValue.assignedManagerId === 'none' ? '' : formValue.assignedManagerId;

      const assignedAt = formValue.assignedManagerId === 'none' ? undefined : new Date();

      const code = generateTicketCode(formValue.department, this.ticketService.getTicketList$()());
      const newTicket: Partial<Ticket> = {
        ...formValue,
        code,
        assignedManagerId,
        // assignedAt,
      };
      const dialogRef = this.dialog.open(ConfirmDialog, {
        data: {
          title: 'Create ticket',
          message: 'Are you sure you want to create a new ticket?',
          confirmText: 'Yes',
          cancelText: 'No',
        },
        panelClass: 'custom-dialog',
        position: {
          left: '40%',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading.set(true);
          this.ticketService
            .createTicket(newTicket)
            .pipe(finalize(() => this.router.navigate(['/', 'tickets'])))
            .subscribe((res) =>
              this.snackbarService.showSnackbar(
                'Ticket created succesfully!',
                SnackbarMode.SUCCESS,
              ),
            );
        }
      });
    } else if (this.selectedTicket) {
      const closedAt = undefined;
      const assignedManagerId =
        formValue.assignedManagerId === 'none' ? '' : formValue.assignedManagerId;

      const assignedAt = formValue.assignedManagerId === 'none' ? undefined : new Date();

      const editedTicket: Ticket = {
        ...this.selectedTicket,
        ...formValue,
        assignedManagerId,
        assignedAt,
        closedAt,
      };

      this.ticketService
        .updateTicket(editedTicket, editedTicket.id)
        .pipe(finalize(() => this.navigateToReadDetails(editedTicket.id)))
        .subscribe((res) =>
          this.snackbarService.showSnackbar('Ticket updated succesfully!', SnackbarMode.SUCCESS),
        );
    }
  }

  onClaimTicket() {
    this.isLoading.set(true);

    const assignedManagerId = this.currentUser()?.id;
    const assignedAt = new Date();

    const updatedTicket = {
      ...this.selectedTicket,
      assignedManagerId,
      assignedAt,
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Claim ticket',
        message: 'Are you sure you want to claim this ticket?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
      panelClass: 'custom-dialog',
      position: {
        left: '40%',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ticketService
          .updateTicket(updatedTicket, updatedTicket.id as string)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe((res) =>
            this.snackbarService.showSnackbar('Ticket assigned succesfully!', SnackbarMode.SUCCESS),
          );
      }
    });
  }

  navigateToReadDetails(editedTicketId: string) {
    this.router.navigate(['/', 'tickets', editedTicketId]);
  }

  navigateToEditTicket() {
    this.router.navigate(['/', 'tickets', this.selectedTicket?.id, 'edit']);
  }

  cancelOperation() {
    if (this.crudMode === CrudMode.CREATE) {
      this.router.navigate(['/', 'tickets']);
    } else {
      this.router.navigate(['/', 'tickets', this.selectedTicket?.id]);
    }
  }
}
