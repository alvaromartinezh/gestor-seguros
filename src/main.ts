import { mount } from 'svelte';
import './presentacion/tema.css';
import App from './presentacion/App.svelte';
import { store } from './presentacion/estado/store.svelte';

store.inicializar();

const app = mount(App, { target: document.getElementById('app')! });

export default app;
