import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  submitted = false;
  loading = false;
  message = '';
  errorMessage = '';

  signUpForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    }),

    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),

    dateOfBirth: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),

    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    acceptTerms: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    })
  });

  showPassword = false;
  showConfirmPassword = false;

  get passwordsDoNotMatch(): boolean {
    const password = this.signUpForm.controls.password.value;
    const confirmPassword = this.signUpForm.controls.confirmPassword.value;
    return confirmPassword.length > 0 && password !== confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    this.errorMessage = '';

    this.signUpForm.markAllAsTouched();

    if (this.signUpForm.invalid || this.passwordsDoNotMatch) {
      return;
    }

    this.loading = true;
    const { firstName, lastName, email, password } = this.signUpForm.getRawValue();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    this.authService.register({ fullName, email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = response.message || 'Registration successful! Your account is pending administrator approval.';
        this.signUpForm.reset();
        this.submitted = false;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/sign-in']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMessage = 'An account with this email address already exists. Please sign in instead.';
        } else if (err.status === 400 && err.error?.errors) {
          const firstErrorKey = Object.keys(err.error.errors)[0];
          this.errorMessage = err.error.errors[firstErrorKey][0] || 'Validation error. Please verify input.';
        } else {
          this.errorMessage = err.error?.message || 'Unable to register at this time. Please try again.';
        }
        this.cdr.markForCheck();
      }
    });
  }
}
