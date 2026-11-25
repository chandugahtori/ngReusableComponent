import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  showPassword = false;
  submitted = false;
  loading = false;
  message = '';
  errorMessage = '';

  signInForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    this.errorMessage = '';

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.signInForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = 'Login successful! Redirecting...';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.errorMessage = err.error?.message || 'Your account is pending administrator approval.';
        } else if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Invalid email or password.';
        } else {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        }
        this.cdr.markForCheck();
      }
    });
  }
}
