import {MicraError} from '@micra/error';

export class InvalidServiceDefinitionError extends MicraError {
  statusCode = 500;

  constructor(definition: unknown) {
    super(
      `Failed to register service with the service container due to an invalid service definition. ${
        typeof definition === 'string'
          ? `Expected a service constructor but got "undefined" while registering "${definition}"`
          : `Expected a string or a Micra.ServiceDefinition, but got "${typeof definition}"`
      }`,
    );

    Object.setPrototypeOf(this, InvalidServiceDefinitionError.prototype);
  }

  serialize(): Micra.ErrorMessage[] {
    return [
      {
        title: 'Invalid Service Definition',
        status: this.statusCode,
        detail: this.message,
      },
    ];
  }
}
