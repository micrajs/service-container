import {MicraError} from '@micra/error';

export class CircularDependencyError extends MicraError {
  statusCode = 500;

  constructor(breadcrumbs: string[]) {
    super(
      `Found a circular dependency while trying to resolve "${
        breadcrumbs[0]
      }": ${breadcrumbs.join(' > ')}`,
    );

    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }

  serialize(): Micra.ErrorMessage[] {
    return [
      {
        title: 'Circular Dependency',
        status: this.statusCode,
        detail: this.message,
      },
    ];
  }
}
