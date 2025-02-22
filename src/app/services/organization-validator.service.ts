import { Injectable } from '@angular/core';
import { Employee, ValidationError, ValidationResult } from '../interfaces/organization.interface';

@Injectable({
  providedIn: 'root'
})
export class OrganizationValidatorService {
  private errors: ValidationError[] = [];

  validateOrganizationStructure(employees: Employee[]): ValidationResult {
    this.errors = [];
    const employeeMap = new Map(employees.map(emp => [emp.Email, emp]));
    const visitedNodes = new Set<string>(); // Track visited nodes to detect the cycle

    // Creating a map to track who reports to each employee
    const reportsToMap = new Map<string, string[]>(); // key : employee mail , value : list of employees who report to this employee

    // First pass: Building he reportsToMap
    employees.forEach(employee => {
      if (employee.ReportsTo) {
        const supervisors = employee.ReportsTo.split(';').map(email => email.trim());
        supervisors.forEach(supervisor => {
          if (!reportsToMap.has(supervisor)) {
            reportsToMap.set(supervisor, []);
          }
          reportsToMap.get(supervisor)?.push(employee.Email);
        });
      }
    });

    // Validate each employee
    employees.forEach((employee, index) => {
      this.validateEmployee(employee, index, employeeMap); // validate Function is to check the normal cases like 
        // 1. Required fields
        // 2. Role values
        // 3. Root case
        // 4. Multiple supervisors
        // 5. Supervisor and hierarchy 
    });

    // Check for cycles
    employees.forEach(employee => {
      if (!visitedNodes.has(employee.Email)) {
        this.detectCycle(employee.Email, employeeMap, employees);
      } // detectCycle function is to check the cycle in the reporting structure this might be not correct will have to check with multiple test cases
    });

    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    };
  }

  private validateEmployee(
    employee: Employee, 
    index: number, 
    employeeMap: Map<string, Employee>
  ): void {
    const rowNumber = index + 2;
    if (!this.validateRequiredFields(employee, rowNumber)) return;
    if (!this.validateRole(employee, rowNumber)) return;
    if (this.handleRootCase(employee, rowNumber)) return;
    if (this.checkMultipleSupervisors(employee, rowNumber)) return;
    this.validateSupervisorAndHierarchy(employee, rowNumber, employeeMap);
  }
   // definitions of all the functions
  private validateRequiredFields(employee: Employee, rowNumber: number): boolean {
    if (!employee.Email || !employee.FullName || !employee.Role) {
      this.addError(rowNumber, employee.FullName || 'Unknown', 
        'Missing required fields (Email, FullName, or Role)');
      return false;
    }
    return true;
  }

  private validateRole(employee: Employee, rowNumber: number): boolean {
    if (!['Root', 'Admin', 'Manager', 'Caller'].includes(employee.Role)) {
      this.addError(rowNumber, employee.FullName,
        `Invalid role: ${employee.Role}. Must be Root, Admin, Manager, or Caller`);
      return false;
    }
    return true;
  }

  private handleRootCase(employee: Employee, rowNumber: number): boolean {
    if (employee.Role === 'Root') {
      if (employee.ReportsTo && 
          employee.ReportsTo.toLowerCase() !== 'none' && 
          employee.ReportsTo !== '') {
        this.addError(rowNumber, employee.FullName, 'Root should not report to anyone');
      }
      return true;
    }
    return false;
  }

  private checkMultipleSupervisors(employee: Employee, rowNumber: number): boolean {
    if (employee.ReportsTo && employee.ReportsTo.includes(';')) {
      this.addError(rowNumber, employee.FullName, 
        'Employee cannot report to multiple supervisors');
      return true;
    }
    return false;
  }

  private validateSupervisorAndHierarchy(
    employee: Employee,
    rowNumber: number,
    employeeMap: Map<string, Employee>
  ): void {
    if (!employee.ReportsTo || 
        employee.ReportsTo.toLowerCase() === 'none' || 
        employee.ReportsTo === '') {
      if (employee.Role !== 'Root') {
        this.addError(rowNumber, employee.FullName, 
          'Non-Root employee must report to someone');
      }
      return;
    }

    const supervisor = employeeMap.get(employee.ReportsTo);
    if (!supervisor) {
      this.addError(rowNumber, employee.FullName,
        `Reports to unknown email: ${employee.ReportsTo}`);
      return;
    }

    this.validateReportingHierarchy(employee, supervisor, rowNumber); // validateReportingHierarchy function is to check the hierarchy of the reporting structure

  }

  private validateReportingHierarchy(
    employee: Employee,
    supervisor: Employee,
    rowNumber: number
  ): void {
    switch (employee.Role) {
        // checking the hierarchy of the reporting structure
      case 'Admin':
        if (supervisor.Role !== 'Root') {
          this.addError(rowNumber, employee.FullName, 
            'Admin can only report to Root');
        }
        break;

      case 'Manager':
        if (supervisor.Role !== 'Admin' && supervisor.Role !== 'Manager') {
          this.addError(rowNumber, employee.FullName,
            'Manager can only report to Admin or another Manager');
        }
        break;

      case 'Caller':
        if (supervisor.Role !== 'Manager') {
          this.addError(rowNumber, employee.FullName,
            'Caller can only report to Manager');
        }
        break;
    }
  }

  private detectCycle(
    email: string,
    employeeMap: Map<string, Employee>,
    employees: Employee[],
    path = new Set<string>()
  ): boolean {
    if (path.has(email)) {
      return true;
    }

    const employee = employeeMap.get(email);
    if (!employee || !employee.ReportsTo || 
        employee.ReportsTo.toLowerCase() === 'none' || 
        employee.ReportsTo === '') {
      return false;
    }
  

    path.add(email); // adding the email to the path set
    const hasCycle = this.detectCycle(employee.ReportsTo, employeeMap, employees, path); // recursive call to the detectCycle function
    path.delete(email); // deleting the email from the path set
    // implemented the basic backtracking method to check the cycle in the reporting structure 
    if (hasCycle) {
      this.addError(
        employees.findIndex(e => e.Email === email) + 2,
        employee.FullName,
        'Circular reporting structure detected'
      );
    }

    return hasCycle;
  }

  private addError(row: number, employee: string, message: string): void {
    this.errors.push({ row, employee, message });
  }
}