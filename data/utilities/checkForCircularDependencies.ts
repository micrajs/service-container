import {CircularDependencyError} from '../errors';
import type {ServiceContainer} from '../classes/ServiceContainer';

export const checkForCircularDependencies = (
  container: ServiceContainer,
  reference: keyof Application.Services,
  breadcrumbs: string[] = [reference],
) => {
  const clazz = container.getBinding(reference);
  if (clazz && typeof clazz === 'object') {
    clazz.dependencies.forEach((dependency) => {
      if (breadcrumbs.includes(dependency)) {
        throw new CircularDependencyError([...breadcrumbs, dependency]);
      }

      checkForCircularDependencies(
        container,
        dependency as keyof Application.Services,
        [...breadcrumbs, dependency],
      );
    });
  }
};
