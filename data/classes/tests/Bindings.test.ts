import {Bindings} from '../Bindings';
import {BindingFactory} from '@/testing/factories';

describe('Bindings tests', () => {
  it('should create a new binding', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();

    bindings.set(binding);

    expect(bindings.definitions).toEqual([binding]);
  });

  it('should return the binding when registered', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();

    const result = bindings.set(binding);

    expect(result).toEqual(binding);
  });

  it('should replace an existing binding', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();
    const newBinding = BindingFactory.make({reference: binding.reference});
    bindings.set(binding);

    bindings.set(newBinding);

    expect(bindings.definitions).toEqual([newBinding]);
  });

  it('should retrieve binding by its reference', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();
    bindings.set(binding);

    const retrieved = bindings.get(binding.reference);

    expect(retrieved).toEqual(binding);
  });

  it('should return undefined if a binding does not exist', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();

    const retrieved = bindings.get(binding.reference);

    expect(retrieved).toBeUndefined();
  });

  it('should return true if a binding is registered', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();
    bindings.set(binding);

    const exists = bindings.has(binding.reference);

    expect(exists).toBe(true);
  });

  it('should return false if a binding is not registered', () => {
    const bindings = new Bindings();
    const binding = BindingFactory.make();

    const exists = bindings.has(binding.reference);

    expect(exists).toBe(false);
  });
});
