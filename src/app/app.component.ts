import { Component } from '@angular/core';
import { OrganizationValidatorComponent } from './components/organization-validator.component';

@Component({
  selector: 'app-root',
  template: `
    <app-organization-validator></app-organization-validator>
  `,
  standalone: true,
  imports: [OrganizationValidatorComponent]
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}