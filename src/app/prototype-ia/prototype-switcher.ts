import { Component, computed, input, output } from '@angular/core';
import { VARIANT_DESCRIPTORS, VariantKey } from './prototype-variants';

// PROTOTYPE (decision ticket 04, throwaway): floating bottom bar that cycles the
// IA variants. Deliberately visually loud so it never reads as part of the design.
@Component({
  selector: 'app-prototype-switcher',
  template: `
    <div class="prototype-switcher" role="toolbar" aria-label="Переключение вариантов прототипа">
      <button
        type="button"
        class="btn btn-dark prototype-switcher__arrow"
        aria-label="Предыдущий вариант"
        (click)="change.emit(step(-1))"
      >
        &larr;
      </button>
      <span class="prototype-switcher__label" aria-live="polite">
        {{ current() }} ({{ name() }})
      </span>
      <button
        type="button"
        class="btn btn-dark prototype-switcher__arrow"
        aria-label="Следующий вариант"
        (click)="change.emit(step(1))"
      >
        &rarr;
      </button>
    </div>
  `,
  styles: `
    .prototype-switcher {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      background: #111;
      box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.6);
      z-index: 2000;
    }

    .prototype-switcher__label {
      color: #fff;
      font-weight: 600;
      min-width: 9rem;
      text-align: center;
      user-select: none;
    }
  `,
})
export class PrototypeSwitcher {
  public readonly current = input.required<VariantKey>();

  public readonly change = output<VariantKey>();

  protected readonly name = computed(
    () => VARIANT_DESCRIPTORS.find((descriptor) => descriptor.key === this.current())?.name ?? '',
  );

  protected step(direction: number): VariantKey {
    const keys = VARIANT_DESCRIPTORS.map((descriptor) => descriptor.key);
    const index = keys.indexOf(this.current());
    const next = keys[(index + direction + keys.length) % keys.length];
    return next;
  }
}
