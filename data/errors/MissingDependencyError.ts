import {MicraError} from '@micra/error';

export class MissingDependencyError extends MicraError {
  statusCode = 500;

  dependency: string;

  constructor(dependency: string) {
    super(
      `Dependency "${dependency}" was not found. Did you remember to register it?`,
    );

    this.dependency = dependency;

    Object.setPrototypeOf(this, MissingDependencyError.prototype);
  }

  serialize(): Micra.ErrorMessage[] {
    return [
      {
        title: 'Missing Dependency',
        status: this.statusCode,
        detail: this.message,
        extras: {
          dependency: this.dependency,
        },
      },
    ];
  }
}
