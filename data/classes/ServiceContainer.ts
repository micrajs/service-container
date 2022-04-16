import {EventEmitter} from '@micra/event-emitter';
import {MissingDependencyError, InvalidServiceDefinitionError} from '../errors';
import {isFactoryServiceDefinition, isServiceDefinition} from '../guards';
import {createServiceFactory} from '../utilities/createServiceFactory';
import {Bindings} from './Bindings';
import type {Binding} from './Bindings';
import type {Static} from '@micra/core/utilities/Static';

export class ServiceContainer
  extends EventEmitter<Micra.ServiceContainerEvents>
  implements Micra.ServiceContainer
{
  protected id: string;
  protected bindings: Bindings;
  protected parent?: ServiceContainer;

  constructor(parent?: ServiceContainer) {
    super();
    this.parent = parent;
    this.bindings = new Bindings();
    this.id =
      Math.random().toString(36).substring(2, 7) +
      Math.random().toString(36).substring(2, 7);

    if (parent) {
      this.emit('clone', {
        containerId: this.id,
        container: this,
      });
    }
  }

  async emit<EventName extends keyof Micra.ServiceContainerEvents>(
    ...args: Micra.EmitArgs<Micra.ServiceContainerEvents, EventName>
  ): Promise<void> {
    if (this.parent) {
      return await this.parent.emit<EventName>(...args);
    }

    return await super.emit<EventName>(...args);
  }

  emitSync<EventName extends keyof Micra.ServiceContainerEvents>(
    ...args: Micra.EmitArgs<Micra.ServiceContainerEvents, EventName>
  ): void {
    if (this.parent) {
      return this.parent.emitSync<EventName>(...args);
    }

    return super.emitSync<EventName>(...args);
  }

  on<K extends keyof Micra.ServiceContainerEvents>(
    event: K,
    cb: (payload: Micra.ServiceContainerEvents[K]) => void,
  ): ReturnType<EventEmitter['on']> {
    return this.parent ? this.parent.on(event, cb) : super.on(event, cb);
  }

  register<Namespace extends keyof Application.Services>(
    namespace: Namespace,
    service: Static<Application.Services[Namespace]>,
  ): this;
  register<Namespace extends keyof Application.Services>(
    serviceDefinition: Micra.ServiceDefinition<Namespace>,
  ): this;
  register<Namespace extends keyof Application.Services>(
    namespaceOrServiceDefinition:
      | Namespace
      | Micra.ServiceDefinition<Namespace>,
    service?: Static<Application.Services[Namespace]>,
  ): this {
    let binding: Binding<Application.Services[Namespace]>;
    if (typeof namespaceOrServiceDefinition === 'string' && service) {
      binding = {
        reference: namespaceOrServiceDefinition,
        isSingleton: false,
        factory: () => new service(),
        original: service,
        dependencies: [],
      };
    } else if (isServiceDefinition(namespaceOrServiceDefinition)) {
      binding = {
        reference: namespaceOrServiceDefinition.namespace,
        isSingleton: false,
        factory: createServiceFactory(
          this,
          namespaceOrServiceDefinition.namespace,
        ),
        original: namespaceOrServiceDefinition.value,
        dependencies: namespaceOrServiceDefinition.dependencies,
      };
    } else {
      throw new InvalidServiceDefinitionError(namespaceOrServiceDefinition);
    }

    this.bindings.set(binding);
    this.emit('set', {
      containerId: this.id,
      namespace: binding.reference,
    });

    return this;
  }

  singleton<Namespace extends keyof Application.Services>(
    namespace: Namespace,
    service: new () => Application.Services[Namespace],
  ): this;
  singleton<Namespace extends keyof Application.Services>(
    serviceDefinition: Micra.ServiceDefinition<Namespace>,
  ): this;
  singleton<Namespace extends keyof Application.Services>(
    namespaceOrServiceDefinition:
      | Namespace
      | Micra.ServiceDefinition<Namespace>,
    service?: Static<Application.Services[Namespace]>,
  ): this {
    let binding: Binding<Application.Services[Namespace]>;
    if (typeof namespaceOrServiceDefinition === 'string' && service) {
      binding = {
        reference: namespaceOrServiceDefinition,
        isSingleton: true,
        factory: () => new service(),
        original: service,
        dependencies: [],
      };
    } else if (isServiceDefinition(namespaceOrServiceDefinition)) {
      binding = {
        reference: namespaceOrServiceDefinition.namespace,
        isSingleton: true,
        factory: createServiceFactory(
          this,
          namespaceOrServiceDefinition.namespace,
        ),
        original: namespaceOrServiceDefinition.value,
        dependencies: namespaceOrServiceDefinition.dependencies,
      };
    } else {
      throw new InvalidServiceDefinitionError(namespaceOrServiceDefinition);
    }

    this.bindings.set(binding);

    this.emit('set', {
      containerId: this.id,
      namespace: binding.reference,
    });

    return this;
  }

  factory<Namespace extends keyof Application.Services>(
    namespace: Namespace,
    factory: Micra.ServiceFactory<Namespace>,
  ): this;
  factory<Namespace extends keyof Application.Services>(
    serviceDefinition: Micra.FactoryServiceDefinition<Namespace>,
  ): this;
  factory<Namespace extends keyof Application.Services>(
    namespaceOrServiceDefinition:
      | Namespace
      | Micra.FactoryServiceDefinition<Namespace>,
    factory?: Micra.ServiceFactory<Namespace>,
  ): this {
    let binding: Binding<Application.Services[Namespace]>;
    if (typeof namespaceOrServiceDefinition === 'string' && factory) {
      binding = {
        reference: namespaceOrServiceDefinition,
        isSingleton: true,
        factory,
        original: factory,
        dependencies: [],
      };
    } else if (isFactoryServiceDefinition(namespaceOrServiceDefinition)) {
      binding = {
        reference: namespaceOrServiceDefinition.namespace,
        isSingleton: namespaceOrServiceDefinition.isSingleton,
        factory: namespaceOrServiceDefinition.factory,
        original: namespaceOrServiceDefinition.factory,
        dependencies: [],
      };
    } else {
      throw new InvalidServiceDefinitionError(namespaceOrServiceDefinition);
    }

    this.bindings.set(binding);

    this.emit('set', {
      containerId: this.id,
      namespace: binding.reference,
    });

    return this;
  }

  value<Namespace extends keyof Application.Services>(
    namespace: Namespace,
    value: Application.Services[Namespace],
  ): this {
    this.bindings.set({
      reference: namespace,
      isSingleton: true,
      factory: () => value,
      original: value,
      dependencies: [],
    });

    this.emit('set', {
      namespace,
      containerId: this.id,
    });

    return this;
  }

  use<Namespace extends keyof Application.Services>(
    namespace: Namespace,
  ): Application.Services[Namespace] {
    const binding = this.getBinding<Namespace>(namespace);

    if (binding.isSingleton) {
      if (!binding.value) {
        binding.value = binding.factory(this);
      }

      return binding.value;
    }

    return binding.factory(this);
  }

  has<Namespace extends keyof Application.Services>(
    namespace: Namespace,
  ): boolean {
    return this.bindings.has(namespace);
  }

  clone(): Micra.ServiceContainer {
    return new ServiceContainer(this);
  }

  getBinding<Namespace extends keyof Application.Services>(
    namespace: Namespace,
  ): Binding<Application.Services[Namespace]> {
    if (this.bindings.has(namespace)) {
      return this.bindings.get(namespace) as Binding;
    }

    if (this.parent && this.parent.has(namespace)) {
      const binding = this.parent.getBinding<Namespace>(namespace);

      if (binding.isSingleton && !binding.value) {
        const clone = {...binding};

        this.bindings.set(clone);

        return clone;
      }

      return binding;
    }

    throw new MissingDependencyError(namespace);
  }
}
