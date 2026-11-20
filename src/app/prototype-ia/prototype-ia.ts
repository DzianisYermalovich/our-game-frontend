import { Component, inject, isDevMode, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrototypeSwitcher } from './prototype-switcher';
import { PrototypeVariantA } from './variant-a';
import { PrototypeVariantB } from './variant-b';
import { PrototypeVariantC } from './variant-c';
import { VARIANT_DESCRIPTORS, VariantKey } from './prototype-variants';

// PROTOTYPE (decision ticket 04, throwaway): three variants of the split IA
// (Home, templates list, read-only template view, games list) as in-memory
// screens on the dev-only /prototype/ia route, switchable via ?variant= and the
// floating bottom bar. Each variant is a full mini-IA the maintainer can react
// to; answers get locked into the decision ticket, the prototype moves to a
// throwaway branch afterwards.

@Component({
  selector: 'app-prototype-ia',
  imports: [PrototypeSwitcher, PrototypeVariantA, PrototypeVariantB, PrototypeVariantC],
  templateUrl: './prototype-ia.html',
  styleUrl: './prototype-ia.scss',
  host: {
    '(document:keydown.arrowright)': 'cycle(1, $event)',
    '(document:keydown.arrowleft)': 'cycle(-1, $event)',
  },
})
export class PrototypeIa {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly devMode = isDevMode();
  protected readonly variant = signal<VariantKey>(this.readInitialVariant());

  protected cycle(direction: number, event: Event): void {
    // Document-level host bindings type $event as plain Event; it is a keyboard event here.
    const keyEvent = event as KeyboardEvent;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    const typing =
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
    if (typing || keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey) {
      return;
    }
    const keys = VARIANT_DESCRIPTORS.map((descriptor) => descriptor.key);
    const index = keys.indexOf(this.variant());
    const next = keys[(index + direction + keys.length) % keys.length];
    this.select(next);
  }

  protected select(variant: VariantKey): void {
    this.variant.set(variant);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { variant },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private readInitialVariant(): VariantKey {
    const raw = this.route.snapshot.queryParamMap.get('variant')?.toUpperCase();
    const keys = VARIANT_DESCRIPTORS.map((descriptor) => descriptor.key);
    return keys.includes(raw as VariantKey) ? (raw as VariantKey) : 'A';
  }
}
