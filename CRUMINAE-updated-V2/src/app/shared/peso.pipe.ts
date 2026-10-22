import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'peso', standalone: false })
export class PesoPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const n = value ?? 0;
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}
