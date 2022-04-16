import {checkForCircularDependencies} from './checkForCircularDependencies';
import {MissingConstructorDependencyError} from '../errors';
import type {Static} from '@micra/core/utilities/Static';
import type {Binding} from '../classes/Bindings';
import type {ServiceContainer} from '../classes/ServiceContainer';

export function createServiceFactory<K extends keyof Application.Services>(
  serviceContainer: ServiceContainer,
  namespace: K,
): Micra.ServiceFactory<K> {
  return function defaultFactory(container) {
    const binding = serviceContainer.getBinding(namespace) as Binding<
      Application.Services[K]
    >;
    const instances: Application.Services[keyof Application.Services][] = [];

    checkForCircularDependencies(serviceContainer, binding.reference);

    for (const dependency of binding.dependencies) {
      if (container.has(dependency)) {
        instances.push(container.use(dependency));
      } else {
        throw new MissingConstructorDependencyError(namespace, dependency);
      }
    }

    return new (binding.original as Static<
      Application.Services[K],
      typeof instances
    >)(...instances);
  };
}
