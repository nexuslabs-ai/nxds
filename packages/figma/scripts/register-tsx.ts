// Lets a script that imports src load the .tsx recipes: `node --import ./scripts/register-tsx.ts`.
import { register } from 'node:module';

register('./tsx-hooks.ts', import.meta.url);
