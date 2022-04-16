/* eslint-disable @typescript-eslint/no-explicit-any */
import {Static} from '@micra/core/utilities/Static';

export type Token<T = any> = string | T | Static<T>;

export interface Binding<T = any> {
  factory(container: Micra.ServiceContainer): T;
  isSingleton: boolean;
  reference: Token;
  value?: T;
  original: unknown;
  dependencies: Token[];
}

export class Bindings {
  definitions: Binding<unknown>[] = [];

  has(reference: Token): boolean {
    return this.definitions.some((binding) => binding.reference === reference);
  }

  get(reference: Token): Binding<unknown> | undefined {
    return this.definitions.find((binding) => binding.reference === reference);
  }

  set(binding: Binding<unknown>): Binding<unknown> {
    if (this.has(binding.reference)) {
      this.definitions = this.definitions.map((current) =>
        binding.reference === current.reference ? binding : current,
      );
    } else {
      this.definitions.push(binding);
    }

    return binding;
  }
}
