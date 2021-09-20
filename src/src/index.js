import signale from 'signale';
import spoofy from './spoofy';
import { signaleConfig } from './logging';

signale.config(signaleConfig);

spoofy.start();
