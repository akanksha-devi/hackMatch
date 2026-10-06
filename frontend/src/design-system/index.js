export * from './tokens';
export * from './contracts';

import tokens from './tokens';
import contracts from './contracts';

export default {
  ...tokens,
  ...contracts,
};
