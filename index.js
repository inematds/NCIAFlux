// Redirect to mobile app entry point
// This file exists because pnpm hoists expo to the monorepo root
// and Metro looks for entry files relative to where expo is installed
import { registerRootComponent } from 'expo';
import App from './apps/mobile/App';

registerRootComponent(App);
