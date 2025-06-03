import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'] 
})
export class UsersComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  users: any[] = [];
  error: string = '';
  search: string = '';
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private auth: AuthService) {
    // Initialize search subject with debounce
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.page = 1;
        this.fetchUsers();
      });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchUsers();
    }
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  onSearch() {
    this.searchSubject.next(this.search);
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.fetchUsers();
  }

  fetchUsers() {
    if (!isPlatformBrowser(this.platformId)) return;

    const params = {
      search: this.search.trim(),
      page: this.page.toString(),
      pageSize: this.pageSize.toString(),
      sort: this.sortDirection
    };

    this.auth.getUsers(params)
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          if (Array.isArray(response)) {
            this.users = response;
            this.totalPages = Math.ceil(response.length / this.pageSize);
          }
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.error = error.message || 'Failed to load users';
          this.users = [];
        }
      });
  }

  goToPage(pageNumber: number) {
    this.page = pageNumber;
    this.fetchUsers();
  }
}
