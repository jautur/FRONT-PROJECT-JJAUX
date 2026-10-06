import { Component } from '@angular/core';

@Component({
  selector: 'app-registre',
  standalone: true,
  template: `
    <section class="auth-card">
      <h1>Registre</h1>
      <p>Crear nou compte del front JJAUX</p>
      <button type="button">Crear compte</button>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(420px, 100%);
        background: white;
        padding: 2rem;
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      }
      h1 {
        margin: 0 0 0.5rem;
      }
      p {
        margin: 0 0 1rem;
        color: #4b5563;
      }
      button {
        border: none;
        background: #10b981;
        color: white;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
      }
    `
  ]
})
export class RegistreComponent {}
