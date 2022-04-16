import fake from '@micra/faker/complete';
import type {Binding} from '@/data/classes/Bindings';

export const BindingFactory = fake.factory<Binding<any>>((fake) => {
  const to = fake.uuid();
  return {
    reference: fake.string(32),
    isSingleton: true,
    value: to,
    factory: () => to,
    original: to,
    dependencies: [],
  };
});
