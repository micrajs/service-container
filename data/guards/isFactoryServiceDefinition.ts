export function isFactoryServiceDefinition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maybeFactoryServiceDefinition: any,
): maybeFactoryServiceDefinition is Micra.FactoryServiceDefinition<
  keyof Application.Services
> {
  return (
    maybeFactoryServiceDefinition != null &&
    typeof maybeFactoryServiceDefinition === 'object' &&
    !Array.isArray(maybeFactoryServiceDefinition) &&
    maybeFactoryServiceDefinition.factory &&
    maybeFactoryServiceDefinition.namespace &&
    typeof maybeFactoryServiceDefinition.isSingleton === 'boolean'
  );
}
