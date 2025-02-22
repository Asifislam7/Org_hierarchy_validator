import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationError } from '../interfaces/organization.interface';
import { OrganizationValidatorService } from '../services/organization-validator.service';
import { FileParserService } from '../services/file-parser.service';

@Component({
  selector: 'app-organization-validator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <header class="header p-4 mb-4">
        <h1 class="text-2xl font-bold">Organization Hierarchy Validator</h1>
      </header>
      <div class="mb-4">
        <label for="file-upload" class="custom-file-upload">
          Choose File
        </label>
        <input 
          id="file-upload"
          type="file" 
          (change)="onFileChange($event)" 
          accept=".xlsx,.xls,.csv"
          class="hidden"
        />
      </div>

      <div *ngIf="errors.length > 0" class="mb-4">
        <h2 class="text-xl font-bold mb-2 text-red-600">Validation Errors Found:</h2>
        <div *ngFor="let error of errors" class="mb-2 p-3 bg-red-100 border-l-4 border-red-500">
          <p><strong>Row {{error.row}}:</strong> {{error.employee}}</p>
          <p>{{error.message}}</p>
        </div>
      </div>

      <div *ngIf="isValid" class="p-3 bg-green-100 border-l-4 border-green-500">
        <p class="font-bold">Success! The organizational hierarchy is valid.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(90deg, #4b6cb7 0%, #182848 100%);
      border-radius: 8px;
      color: white;
      text-align: center;
    }
    .custom-file-upload {
      display: inline-block;
      padding: 8px 12px;
      cursor: pointer;
      background-color: #4b6cb7;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    .custom-file-upload:hover {
      background-color: #182848;
    }
    .hidden {
      display: none;
    }
  `]
})
export class OrganizationValidatorComponent {
  errors: ValidationError[] = [];
  isValid = false;

  constructor(
    private organizationValidator: OrganizationValidatorService,
    private fileParser: FileParserService
  ) {}

  async onFileChange(event: any) {
    this.errors = [];
    this.isValid = false;
    
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const employees = await this.fileParser.parseExcelFile(file);
      const result = this.organizationValidator.validateOrganizationStructure(employees);
      this.errors = result.errors;
      this.isValid = result.isValid;
    } catch (error) {
      this.errors = [{
        row: 0,
        employee: 'File Error',
        message: 'Failed to parse the Excel file. Please check the format.'
      }];
    }
  }
}