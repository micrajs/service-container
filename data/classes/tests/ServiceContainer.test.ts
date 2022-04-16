import {Static} from '@micra/core/utilities/Static';
import {MissingDependencyError} from '../../errors';
import {Bindings} from '../Bindings';
import {ServiceContainer as PrivateServiceContainer} from '../ServiceContainer';

type TestServiceContainer = Micra.ServiceContainer & {
  id: string;
  bindings: Bindings;
  parent?: TestServiceContainer;
};
const ServiceContainer =
  PrivateServiceContainer as unknown as Static<TestServiceContainer>;

class MyClass {
  id: string;

  constructor(id: string = Math.random().toString(36).substring(2, 7)) {
    this.id = id;
  }
}

declare global {
  namespace Application {
    interface Services {
      MySingleton: MyClass;
      MyBinding: MyClass;
      MyValue: MyClass;
      MyFactory: MyClass;
    }
  }
}

describe('ServiceContainer tests', () => {
  it('should create a container id', () => {
    const serviceContainer = new ServiceContainer();

    const id = serviceContainer.id;

    expect(typeof id).toBe('string');
  });

  it('should add a singleton binding', () => {
    const serviceContainer = new ServiceContainer();

    serviceContainer.singleton('MySingleton', MyClass);
    const [binding] = serviceContainer.bindings.definitions;

    expect(binding.isSingleton).toBe(true);
    expect(binding.reference).toBe('MySingleton');
    expect(binding.original).toBe(MyClass);
  });

  it('should emit a set event when a singleton service is added', () => {
    const listener = vi.fn();
    const serviceContainer = new ServiceContainer();
    serviceContainer.on('set', listener);

    serviceContainer.singleton('MySingleton', MyClass);

    expect(listener).toHaveBeenCalledWith({
      namespace: 'MySingleton',
      containerId: serviceContainer.id,
    });
  });

  it('should add a non-singleton binding', () => {
    const serviceContainer = new ServiceContainer();

    serviceContainer.register('MyBinding', MyClass);
    const [binding] = serviceContainer.bindings.definitions;

    expect(binding.isSingleton).toBe(false);
    expect(binding.reference).toBe('MyBinding');
    expect(binding.original).toBe(MyClass);
  });

  it('should emit a set event when a non-singleton service is added', () => {
    const listener = vi.fn();
    const serviceContainer = new ServiceContainer();
    serviceContainer.on('set', listener);

    serviceContainer.register('MyBinding', MyClass);

    expect(listener).toHaveBeenCalledWith({
      namespace: 'MyBinding',
      containerId: serviceContainer.id,
    });
  });

  it('should add a value binding', () => {
    const value = new MyClass();
    const serviceContainer = new ServiceContainer();

    serviceContainer.value('MyValue', value);
    const [binding] = serviceContainer.bindings.definitions;

    expect(binding.isSingleton).toBe(true);
    expect(binding.reference).toBe('MyValue');
    expect(binding.original).toBe(value);
  });

  it('should emit a set event when a value service is added', () => {
    const listener = vi.fn();
    const value = new MyClass();
    const serviceContainer = new ServiceContainer();
    serviceContainer.on('set', listener);

    serviceContainer.value('MyValue', value);

    expect(listener).toHaveBeenCalledWith({
      namespace: 'MyValue',
      containerId: serviceContainer.id,
    });
  });

  it('should add a factory binding', () => {
    const factory = () => new MyClass('my_id');
    const serviceContainer = new ServiceContainer();

    serviceContainer.factory('MyFactory', factory);
    const [binding] = serviceContainer.bindings.definitions;

    expect(binding.isSingleton).toBe(true);
    expect(binding.reference).toBe('MyFactory');
    expect(binding.original).toBe(factory);
  });

  it('should emit a set event when a factory service is added', () => {
    const listener = vi.fn();
    const factory = () => new MyClass('my_id');
    const serviceContainer = new ServiceContainer();
    serviceContainer.on('set', listener);

    serviceContainer.factory('MyFactory', factory);

    expect(listener).toHaveBeenCalledWith({
      namespace: 'MyFactory',
      containerId: serviceContainer.id,
    });
  });

  it('should return true if a service exist', () => {
    const serviceContainer = new ServiceContainer();

    serviceContainer.singleton('MySingleton', MyClass);

    expect(serviceContainer.has('MySingleton')).toBe(true);
  });

  it('should return false if a service does not exist', () => {
    const serviceContainer = new ServiceContainer();

    expect(serviceContainer.has('MySingleton')).toBe(false);
  });

  it('should retrieve a singleton service', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.singleton('MySingleton', MyClass);

    const service = serviceContainer.use('MySingleton');

    expect(service).toBeInstanceOf(MyClass);
  });

  it('should always retrieve the same instance of a singleton service', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.singleton('MySingleton', MyClass);

    const first = serviceContainer.use('MySingleton');
    const second = serviceContainer.use('MySingleton');

    expect(first).toBe(second);
  });

  it('should retrieve a non-singleton service', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.register('MyBinding', MyClass);

    const service = serviceContainer.use('MyBinding');

    expect(service).toBeInstanceOf(MyClass);
  });

  it('should not retrieve the same instance of a non-singleton service', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.register('MyBinding', MyClass);

    const first = serviceContainer.use('MyBinding');
    const second = serviceContainer.use('MyBinding');

    expect(first).not.toBe(second);
  });

  it('should retrieve a value service', () => {
    const value = new MyClass();
    const serviceContainer = new ServiceContainer();
    serviceContainer.value('MyValue', value);

    const service = serviceContainer.use('MyValue');

    expect(service).toBe(value);
  });

  it('should retrieve a factory service', () => {
    const ID = 'my_id';
    const factory = () => new MyClass(ID);
    const serviceContainer = new ServiceContainer();
    serviceContainer.factory('MyFactory', factory);

    const service = serviceContainer.use('MyFactory');

    expect(service.id).toBe(ID);
  });

  it('should always retrieve the same instance of a factory service', () => {
    const ID = 'my_id';
    const factory = () => new MyClass(ID);
    const serviceContainer = new ServiceContainer();
    serviceContainer.factory('MyFactory', factory);

    const first = serviceContainer.use('MyFactory');
    const second = serviceContainer.use('MyFactory');

    expect(first).toBe(second);
  });

  it('should call a clone listener when a container is cloned', () => {
    const listener = vi.fn();
    const serviceContainer = new ServiceContainer();
    serviceContainer.on('clone', listener);

    const childServiceContainer =
      serviceContainer.clone() as TestServiceContainer;

    expect(listener).toBeCalledWith({
      container: childServiceContainer,
      containerId: childServiceContainer.id,
    });
  });

  it('should return a value from the parent from a child container', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.singleton('MySingleton', MyClass);
    const childServiceContainer = serviceContainer.clone();

    const service = childServiceContainer.use('MySingleton');

    expect(service).toBeInstanceOf(MyClass);
  });

  it('should not return a value from the child from a parent container', () => {
    const serviceContainer = new ServiceContainer();
    const childServiceContainer = serviceContainer.clone();

    childServiceContainer.singleton('MySingleton', MyClass);

    expect(() => serviceContainer.use('MySingleton')).toThrowError(
      MissingDependencyError,
    );
  });

  it('should return a different instance from a child container if the singleton does was not instantiated on the parent first', () => {
    const serviceContainer = new ServiceContainer();
    serviceContainer.singleton('MySingleton', MyClass);
    const childServiceContainer = serviceContainer.clone();

    const childService = childServiceContainer.use('MySingleton');
    const parentService = serviceContainer.use('MySingleton');

    expect(parentService).not.toBe(childService);
  });
});
