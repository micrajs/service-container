export function isServiceDefinition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maybeServiceDefinition: any,
): maybeServiceDefinition is Micra.ServiceDefinition<
  keyof Application.Services
> {
  return (
    maybeServiceDefinition != null &&
    typeof maybeServiceDefinition === 'object' &&
    !Array.isArray(maybeServiceDefinition) &&
    maybeServiceDefinition.dependencies &&
    maybeServiceDefinition.namespace &&
    maybeServiceDefinition.value
  );
}
