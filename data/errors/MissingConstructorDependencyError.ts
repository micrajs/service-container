import {MicraError} from '@micra/error';

export class MissingConstructorDependencyError extends MicraError {
  statusCode = 500;
  dependent: string;
  dependency: string;

  constructor(dependent: string, dependency: string) {
    super(
      `Couldn't initialize "${dependent}". The dependency "${dependency}" is missing from the container. Did you remember to register it?`,
    );

    this.dependent = dependent;
    this.dependency = dependency;

    Object.setPrototypeOf(this, MissingConstructorDependencyError.prototype);
  }

  serialize(): Micra.ErrorMessage[] {
    return [
      {
        title: 'Missing Dependency',
        status: this.statusCode,
        detail: this.message,
        extras: {
          dependent: this.dependent,
          dependency: this.dependency,
        },
      },
    ];
  }
}
